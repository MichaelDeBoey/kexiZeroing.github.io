---
layout: "../layouts/BlogPost.astro"
title: "Form validation with React Hook Form and Zod"
slug: form-validation-with-react-hook-form-and-zod
description: ""
added: "Aug 6 2023"
tags: [web]
updatedDate: "Jan 2 2024"
---

## Setup

```sh
# React + TypeScript
npm create vite@latest

npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

npm i react-hook-form @hookform/resolvers zod
```

## Building the Validation Schema with Zod

```js
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
```

[Zod](https://github.com/colinhacks/zod) is a TypeScript-first schema declaration and validation library. With Zod, you declare a validator once and Zod will automatically infer the static TypeScript type. It's easy to compose simpler types into complex data structures.

```js
import { z } from "zod";

// creating a schema for strings
const mySchema = z.string();

// parsing
mySchema.parse("tuna"); // => "tuna"
mySchema.parse(12); // => throws ZodError

// "safe" parsing (doesn't throw error if validation fails)
mySchema.safeParse("tuna"); // => { success: true; data: "tuna" }
mySchema.safeParse(12); // => { success: false; error: ZodError }

const User = z.object({
  username: z.string(),
});

User.parse({ username: "Ludwig" });

// extract the inferred type
type User = z.infer<typeof User>;
// { username: string }
```

Sometimes you don't trust the data entering your app. For those cases, you should use Zod. Let’s build a schema for our form.

```js
const formSchema = z
  .object({
    username: z.string().min(1, "Username is required").max(100),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must have more than 8 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  // Zod lets you provide custom validation logic via refinements.
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"], // path of error
    message: "Passwords do not match",
});

// We will use this type to tell react-hook-form what our data should look like.
type FormSchemaType = z.infer<typeof formSchema>;
```

> [Valibot](https://github.com/fabian-hiller/valibot) is very similar to Zod, helping you validate data easily using a schema. The biggest difference is the modular design and the ability to reduce the bundle size to a minimum. 

## Implementing React Hook Form
Creating forms in React is a complex task. It involves handling all the input states and their changes and validating that input when the form gets submitted. The library [React Hook Form](https://www.react-hook-form.com) comes with a custom hook named `useForm`, which will let us register our inputs, handle the form submission, and handle errors.

[@hookform/resolvers](https://github.com/react-hook-form/resolvers) allows you to use any external validation library such as Yup, Zod, and many others. The goal is to make sure you can seamlessly integrate whichever validation library you prefer. If you're not using a library, you can always write your own logic to validate your forms.

```jsx
const App = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register('name')} />
      {errors.name?.message && <p>{errors.name?.message}</p>}
      <input type="number" {...register('age', { valueAsNumber: true })} />
      {errors.age?.message && <p>{errors.age?.message}</p>}
      <input type="submit" />
    </form>
  );
};
```

- `register`: this method allows you to register an input element and apply validation rules. What's happened to the input after invoke register API:

  ```js
  const { onChange, onBlur, name, ref } = register('firstName'); 
  // include type check against field path with the name you have supplied.
          
  <input 
    onChange={onChange} // assign onChange event 
    onBlur={onBlur} // assign onBlur event
    name={name} // assign name prop
    ref={ref} // assign ref prop
  />
  // same as above
  <input {...register('firstName')} />
  ```

- `handleSubmit`: this function will receive the form data if form validation is successful.
- `formState`: this object contains information about the entire form state (i.e., `isDirty`, `dirtyFields`, `isSubmitted`, `isSubmitting`, `isValid`, `errors`). It helps you to keep on track with the user's interaction with your form application.

Now, let's create our form. We will use `register` to tell react-hook-form what inputs to check, `handleSubmit` to handle the form submission, `errors` is an object that will contain all of the form errors, and `isSubmitting` contains a boolean that we can use to check if the form is currently being submitted. When you fill out the form and click the submit button you should be able to see the form data in the console if it is valid.

```js
function App() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormSchemaType> = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <label htmlFor="username">
          Your username
        </label>
        <input
          type="text"
          id="username"
          placeholder="Your name"
          {...register("username")}
        />
        {errors.username && (
          <span>{errors.username?.message}</span>
        )}
      </div>
      <div>
        <label htmlFor="email">
          Your email
        </label>
        <input
          type="email"
          id="email"
          placeholder="name@company.com"
          {...register("email")}
        />
        {errors.email && (
          <span>{errors.email?.message}</span>
        )}
      </div>
      <div>
        <label htmlFor="password">
          Password
        </label>
        <input
          type="password"
          id="password"
          {...register("password")}
        />
        {errors.password && (
          <span>{errors.password?.message}</span>
        )}
      </div>
      <div>
        <label htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          type="password"
          id="confirmPassword"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <span>{errors.confirmPassword?.message}</span>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
      >
        Create an account
      </button>
    </form>
  );
}
```

## Using shadcn `<Form />` component
- https://ui.shadcn.com/docs/components/form
- https://ui.shadcn.com/examples/forms
- https://manupa.dev/blog/anatomy-of-shadcn-ui

To understand shadcn/ui, first we need to know what does `class-variance-authority` do. It basically is a function, that allows us to define variants for the element we want to style. A simple variant definition has a name and a list of possible values, each with a list of classes that should apply.

Let's build a button component, using `cva` to handle our variant's classes.

```jsx
// Using `cva` to handle our variant's classes
import { cva } from "class-variance-authority";
 
const buttonVariants = cva(["font-semibold", "border", "rounded"], {
  variants: {
    intent: {
      primary: [
        "bg-blue-500",
        "text-white",
        "border-transparent",
        "hover:bg-blue-600",
      ],
      // **or**
      // primary: "bg-blue-500 text-white border-transparent hover:bg-blue-600",
      secondary: [
        "bg-white",
        "text-gray-800",
        "border-gray-400",
        "hover:bg-gray-100",
      ],
    },
    size: {
      small: ["text-sm", "py-1", "px-2"],
      medium: ["text-base", "py-2", "px-4"],
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "medium",
  },
});
 
buttonVariants();
// => "font-semibold border rounded bg-blue-500 text-white border-transparent hover:bg-blue-600 text-base py-2 px-4"
 
buttonVariants({ intent: "secondary", size: "small" });
// => "font-semibold border rounded bg-white text-gray-800 border-gray-400 hover:bg-gray-100 text-sm py-1 px-2"
```

[clsx](https://github.com/lukeed/clsx) is used in `cva`. It is a utility for constructing `className` strings conditionally.

```js
import clsx from 'clsx';

clsx('foo', true && 'bar', 'baz');
//=> 'foo bar baz'

clsx({ foo:true, bar:false, baz:isTrue() });
//=> 'foo baz'

clsx({ foo:true }, { bar:false }, null, { '--foobar':'hello' });
//=> 'foo --foobar'

clsx(['foo', 0, false, 'bar']);
//=> 'foo bar'

clsx(['foo'], ['', 0, false, 'bar'], [['baz', [['hello'], 'there']]]);
//=> 'foo bar baz hello there'
```
