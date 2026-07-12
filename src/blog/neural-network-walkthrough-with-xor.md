---
title: "Walking through a simple neural network with XOR"
description: ""
added: "Jul 12 2026"
tags: [AI]
---

A tutorial on how neural networks learn, using the classic XOR problem as an example.

## 1. What a neuron actually computes

A single artificial neuron is a two-step calculation:

```
z = w1*x1 + w2*x2 + b      (weighted sum, or "pre-activation")
a = σ(z)                   (activation — squashes z into a usable range)
```

- `x1, x2` — inputs
- `w1, w2` — weights (learned parameters, one per input)
- `b` — bias
- `σ` — an activation function, here the **sigmoid**:

```
σ(x) = 1 / (1 + e^(-x))
```

Sigmoid maps any real number into the open interval `(0, 1)`. Large positive `x` → output near 1. Large negative `x` → output near 0. `x = 0` → output exactly 0.5. For the output neuron in a binary classifier, the sigmoid output can be interpreted as the predicted probability that the answer is 1. For hidden neurons, it's simply an activation value passed to the next layer.

Notation: `z` is the raw weighted sum; `a` (or `h` for a hidden neuron, `ŷ` for the final output) is what gets passed to the next layer.

## 2. The problem: XOR

XOR (exclusive or) returns 1 when its two binary inputs differ.

Plot these four points on a 2D grid. There is no single straight line that puts both 1s on one side and both 0s on the other.

A single neuron's decision boundary — the set of points where it's equally uncertain between 0 and 1 — is the set of points where `z = 0`:

```
w1*x1 + w2*x2 + b = 0
```

This is the equation of a straight line. No matter what values you pick for `w1`, `w2`, `b`, this equation always describes a line, never a curve.

## 3. Why depth requires non-linearity

The fix seems obvious: stack more layers. But stacking linear layers doesn't help. Watch what happens with two linear layers and no activation function:

```
h = W1·x + b1
ŷ = W2·h + b2
```

Substitute the first into the second:

```
ŷ = W2·(W1·x + b1) + b2
  = (W2·W1)·x + (W2·b1 + b2)
  = W'·x + b'          where W' = W2·W1, b' = W2·b1 + b2
```

Two chained matrix multiplications collapse into one. Any number of linear layers stacked together is mathematically equivalent to a single linear layer.

Inserting `σ` between layers breaks this collapse:

```
ŷ = W2·σ(W1·x + b1) + b2
```

The collapse worked because `h = W1·x + b1` is an affine function of `x` — meaning equal steps in `x` always produce equal steps in `h`, so a single matrix `W2` could act on it uniformly. Applying `σ` makes the mapping nonlinear, so the composition can no longer be rewritten as a single affine transformation. That's why non-linear activation functions are essential for deep networks.

Requirements on the activation function, in order of importance:

- non-linear
- differentiable almost everywhere (backprop chains derivatives through it)
- not flat over large regions (flat → zero gradient → learning stalls)
- monotonic is a soft preference, not a hard requirement (modern nets use
  non-monotonic activations like GELU/Swish successfully)

Sigmoid satisfies all of these, which is why it was the historical default (later largely replaced by ReLU for deep networks, for reasons around gradient vanishing at sigmoid's tails — a separate topic).

## 4. The fix: a hidden layer

Add 4 neurons between input and output: a 2 → 4 → 1 architecture.

Two weight matrices, two biases:

- W1 — input → hidden weights, shape 2×4 (2 inputs, 4 hidden neurons)
- b1 — hidden biases, shape 4×1, one per hidden neuron
- w2 — hidden → output weights, shape 4×1, one per hidden neuron
- b2 — output bias, a single number

General rule of thumb, useful beyond this one example: a weight matrix connecting a layer of size `n_in` to a layer of size `n_out` always has shape `n_in` × `n_out`. The bias vector for that destination layer always has shape `n_out` × 1, one bias per neuron in that layer.

> Why weights become a matrix here. In section 1, a single neuron had two scalar weights, w1 and w2 — one per input. A layer of 4 neurons needs 4 separate copies of that, since each neuron has its own pair of weights. Laying those out in a grid — one column per neuron, one row per input — gives a 2×4 matrix. W1[0][1] reads as "the weight from input x1 into the second neuron."
>
> Note on names: section 1's w1, w2 were two scalar weights belonging to one neuron. Starting here, W1 (capital, a matrix) names an entire layer's weights, and w2 (lowercase, a vector) names the next layer's weights.

Hidden layer — every neuron's equation written out explicitly:

```
h1 = σ(x1*W1[0][0] + x2*W1[1][0] + b1[0])
h2 = σ(x1*W1[0][1] + x2*W1[1][1] + b1[1])
h3 = σ(x1*W1[0][2] + x2*W1[1][2] + b1[2])
h4 = σ(x1*W1[0][3] + x2*W1[1][3] + b1[3])
```

Output layer — the single output neuron:

```
ŷ = σ(h1*w2[0] + h2*w2[1] + h3*w2[2] + h4*w2[3] + b2)
```

Each hidden neuron still contributes only a linear boundary. By combining many of these boundaries, the network can represent much more complex, nonlinear decision boundaries. With enough hidden neurons, neural networks can approximate arbitrarily complex functions.

## 5. Loss: measuring how wrong the network is

```
L = (ŷ - y)²
```

`y` is the true label (ground truth), `ŷ` ("y-hat") is the model's prediction. Squaring makes the loss non-negative and penalizes larger errors more heavily.

## 6. Gradient descent: the update rule

Every trainable parameter `w` gets updated as:

```
w ← w - lr * (∂L/∂w)
```

- `∂L/∂w` is the **gradient** — "if `w` increases slightly, how much does `L` change, and in which direction." It only tells you a _direction_, not a step size.
- `lr` (**learning rate**) is the step size you choose. Too small → training crawls (many epochs needed). Too large → you overshoot the minimum and can oscillate or diverge entirely (loss increases or becomes `NaN`).
- The minus sign: gradients point toward _increasing_ loss, so subtracting moves toward _decreasing_ loss.

Let's derive `w1 -= lr * delta * x1` using the chain rule.

Define:

```
z = x1*w1 + x2*w2 + b
a = σ(z)
L = (a - y)²
```

`w1` affects `L` only through the chain `w1 → z → a → L`, so:

```
∂L/∂w1 = (∂L/∂a) * (∂a/∂z) * (∂z/∂w1)
```

Compute each factor:

- `∂L/∂a = 2(a - y) = 2 * error`
- `∂a/∂z = σ'(z)` — the sigmoid derivative
- `∂z/∂w1 = x1`

Multiply:

```
∂L/∂w1 = 2 * error * σ'(z) * x1
```

Simplify using sigmoid's own derivative formula, `σ'(z) = σ(z) * (1 - σ(z)) = a * (1 - a)`:

```
∂L/∂w1 = 2 * error * a * (1 - a) * x1
```

Define `delta = error * a * (1 - a)`, so:

```
∂L/∂w1 = 2 * delta * x1
```

The leftover 2 gets folded into `lr` since `lr` is a value you choose anyway. This gives the final rule:

```
w1 ← w1 - lr * delta * x1
```

which is exactly the code's update rule.

## 7. Backpropagation: assigning blame across layers

With a hidden layer, the question becomes: the final output was wrong, but across 4 hidden neurons, how much is each one to blame?

Setup with an input `x = (1, 0)`, target `y = 1`, learning rate `lr = 1`,
and just 2 hidden neurons:

```
W1 = [[0.5, -0.3], [0.8, 0.1]]     b1 = [0, 0]
w2 = [0.6, -0.9]                   b2 = 0
```

### Forward pass

Naming convention: `z1`, `z2` are the pre-activation values of hidden neurons. The output
neuron gets `z_out` instead of a number, since there's only one, same role, just no index needed.

```
z1 = x1*W1[0][0] + x2*W1[1][0] + b1[0] = 1*0.5 + 0*0.8 = 0.5
z2 = x1*W1[0][1] + x2*W1[1][1] + b1[1] = 1*(-0.3) + 0*0.1 = -0.3

h1 = σ(0.5)  = 0.6225
h2 = σ(-0.3) = 0.4256

z_out = h1*w2[0] + h2*w2[1] + b2 = 0.6225*0.6 + 0.4256*(-0.9) = -0.0095
ŷ = σ(-0.0095) = 0.4976
```

### Loss

```
error = ŷ - y = 0.4976 - 1 = -0.5024
L = error² = 0.2524
```

### Backward pass — output layer

What's needed here is `σ'(z_out)` — the derivative of `σ` at the pre-activation value that produced `ŷ`.

```
σ'(z_out) = ŷ * (1 - ŷ) = 0.4976 * 0.5024 = 0.2500
δ_out = error * σ'(z_out) = -0.5024 * 0.2500 = -0.1256
```

### Backward pass — hidden layer

This is the key step. `h1` influences the final output only through the path `h1 → z_out`, weighted by `w2[0]`. Each hidden neuron's delta is the output delta, weighted by how strongly that neuron influences the output (`w2`), and multiplied by the local slope of its sigmoid activation.

```
δ_hidden1 = δ_out * w2[0] * σ'(h1) = -0.1256 * 0.6 * (0.6225 * 0.3775) = -0.0177
δ_hidden2 = δ_out * w2[1] * σ'(h2) = -0.1256 * (-0.9) * (0.4256 * 0.5744) = 0.0276
```

Note `h2` gets a larger delta magnitude (`|w2[1]| = 0.9 > |w2[0]| = 0.6`) — it has more "influence" on the output, so it's assigned more of the blame. This is precisely what "backpropagation" means: the output error is distributed backward through the network, weighted by each connection's contribution.

### Gradients

Every gradient follows the same pattern: **(this layer's delta) × (the input that flowed into this weight)**.

```
∂L/∂w2[0]    = δ_out * h1        = -0.1256 * 0.6225 = -0.0782
∂L/∂w2[1]    = δ_out * h2        = -0.1256 * 0.4256 = -0.0535
∂L/∂b2       = δ_out                                = -0.1256

∂L/∂W1[0][0] = δ_hidden1 * x1    = -0.0177 * 1       = -0.0177
∂L/∂W1[1][0] = δ_hidden1 * x2    = -0.0177 * 0       = 0
∂L/∂W1[0][1] = δ_hidden2 * x1    =  0.0276 * 1       = 0.0276
∂L/∂W1[1][1] = δ_hidden2 * x2    =  0.0276 * 0       = 0
∂L/∂b1[0]    = δ_hidden1                             = -0.0177
∂L/∂b1[1]    = δ_hidden2                             = 0.0276
```

`δ_out * h1` and `δ_hidden1 * x1` are the same computation one layer apart: `h1` is what fed `w2[0]` during the forward pass, `x1` is what fed `W1[0][0]`.

### Update (lr = 1)

```
w2[0] ← 0.6 - (-0.0782)   = 0.6782
w2[1] ← -0.9 - (-0.0535)  = -0.8465
b2    ← 0 - (-0.1256)     = 0.1256

W1[0][0] ← 0.5 - (-0.0177) = 0.5177
W1[1][0] ← 0.8 - 0         = 0.8
W1[0][1] ← -0.3 - 0.0276   = -0.3276
W1[1][1] ← 0.1 - 0         = 0.1
b1[0]    ← 0 - (-0.0177)   = 0.0177
b1[1]    ← 0 - 0.0276      = -0.0276
```

Sanity check: target is 1, `ŷ` is only 0.4976 — too low. `h1` is positive, so increasing `w2[0]` increases `ŷ`, which is exactly the direction just applied.

Everything above reduces to four repeated steps, run once per training example, for thousands of epochs:

1. Forward pass: compute `z`, then `a = σ(z)`, layer by layer, ending in `ŷ`.
2. Loss: compare `ŷ` to `y` with `L = (ŷ-y)²`.
3. Backward pass: starting from `δ_out`, propagate a delta backward through each layer, multiplying by that layer's weights and its own `σ'` at each step.
4. Update: for every weight, `w ← w - lr * (that layer's delta) * (the input that fed it)`.

> An epoch is one complete pass through the entire training set. It is not a single loop iteration or a single weight update. In this example, one epoch processes all four XOR training examples. Since the weights are updated after each example, one epoch contains four separate weight updates.

## 8. TypeScript implementation

1. When you train a neural network, the only thing it "learns" is a set of numbers called weights and biases. The entire intelligence of the network is captured in these numbers.
2. Real frameworks (PyTorch, JAX) autograd every `∂L/∂w` for you, you never hand-derive gradients.

```typescript
const XOR_INPUTS: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];
const XOR_TARGETS = [0, 1, 1, 0];

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function sigmoidDeriv(output: number): number {
  return output * (1 - output);
}

function randWeight(): number {
  return Math.random() * 2 - 1; // uniform in [-1, 1]
}

// --- Single-layer perceptron: provably cannot solve XOR ---
function trainSingleLayer(epochs: number, lr = 1.0) {
  let w1 = randWeight();
  let w2 = randWeight();
  let bias = 0;

  for (let epoch = 0; epoch < epochs; epoch++) {
    let totalLoss = 0;

    for (let i = 0; i < XOR_INPUTS.length; i++) {
      const [x1, x2] = XOR_INPUTS[i];
      const target = XOR_TARGETS[i];

      // Forward pass
      const output = sigmoid(x1 * w1 + x2 * w2 + bias);
      const error = output - target;
      totalLoss += error * error;

      // Backward pass + update
      const delta = error * sigmoidDeriv(output);
      w1 -= lr * delta * x1;
      w2 -= lr * delta * x2;
      bias -= lr * delta;
    }

    if (epoch % 200 === 0) {
      console.log(`epoch ${epoch}: loss = ${(totalLoss / 4).toFixed(4)}`);
    }
  }

  return { w1, w2, bias };
}

// --- Multi-layer network: 2 -> 4 -> 1, solves XOR via backprop ---
function trainMultiLayer(epochs: number, lr = 1.0) {
  const HIDDEN = 4;

  const w1: number[][] = Array.from({ length: 2 }, () =>
    Array.from({ length: HIDDEN }, randWeight),
  );
  const b1: number[] = Array(HIDDEN).fill(0);
  const w2: number[] = Array.from({ length: HIDDEN }, randWeight);
  let b2 = 0;

  for (let epoch = 0; epoch < epochs; epoch++) {
    let totalLoss = 0;

    for (let i = 0; i < XOR_INPUTS.length; i++) {
      const [x1, x2] = XOR_INPUTS[i];
      const target = XOR_TARGETS[i];

      // Forward pass: input -> hidden
      const hidden: number[] = [];
      for (let j = 0; j < HIDDEN; j++) {
        hidden[j] = sigmoid(x1 * w1[0][j] + x2 * w1[1][j] + b1[j]);
      }

      // Forward pass: hidden -> output
      let sum = b2;
      for (let j = 0; j < HIDDEN; j++) {
        sum += hidden[j] * w2[j];
      }
      const output = sigmoid(sum);

      const error = output - target;
      totalLoss += error * error;

      // Backward pass: output layer delta
      const outputDelta = error * sigmoidDeriv(output);

      // Backward pass: hidden layer deltas, weighted by each neuron's
      // contribution (w2[j]) to the final output
      const hiddenDelta: number[] = [];
      for (let j = 0; j < HIDDEN; j++) {
        hiddenDelta[j] = outputDelta * w2[j] * sigmoidDeriv(hidden[j]);
      }

      // Update hidden -> output weights
      for (let j = 0; j < HIDDEN; j++) {
        w2[j] -= lr * outputDelta * hidden[j];
      }
      b2 -= lr * outputDelta;

      // Update input -> hidden weights
      const inputs = [x1, x2];
      for (let j = 0; j < HIDDEN; j++) {
        for (let k = 0; k < 2; k++) {
          w1[k][j] -= lr * hiddenDelta[j] * inputs[k];
        }
        b1[j] -= lr * hiddenDelta[j];
      }
    }

    if (epoch % 200 === 0) {
      console.log(`epoch ${epoch}: loss = ${(totalLoss / 4).toFixed(4)}`);
    }
  }

  return { w1, b1, w2, b2 };
}

// Run both and compare final loss curves.
//
// Single-layer network: XOR isn't linearly separable, so it converges to
// ŷ ≈ 0.5 for every input. Loss plateaus
// at exactly (0.5-0)² = (0.5-1)² = 0.25 and never drops further.
//
// Multi-layer network: the hidden layer can bend the decision boundary,
// so it actually separates the classes — loss should approach 0.
trainSingleLayer(2000);
trainMultiLayer(2000);
```
