---
title: "Understand SPC pattern and lazy resource pattern"
description: ""
added: "Dec 26 2025"
tags: [js, react]
updatedDate: "Apr 13 2026"
---

## Store-Presenter-Component (SPC) Pattern

In a typical React app, you'd put state, logic, and rendering in one component with `useState` + `useEffect`. If multiple components need the same data, you'd use a custom hook — but each hook call creates its own state copy. Three components = three `useState` = three separate API calls. You could fix this with Context, or React Query, or lifting state up. Here we chose a different path: pull the state out of React entirely. Put it in a plain class (the Store), make it observable with MobX, and let any component subscribe to it.

SPC is a frontend architecture — a variant of Model-View-Presenter where:

- Store: Observable data container. `@observable.ref` fields, `@computed` getters. No logic, no actions, no side effects.
- Presenter: All business logic. `@action` methods mutate stores. Handles API calls, analytics, derived state. Dependencies injected via constructor.
- Component: Pure functional React component. Receives data and callbacks as props. No MobX, no store/presenter awareness.
- Factory (`create.tsx`): Wires store + presenter + component together. Wraps in `mobxReactLite.observer` so MobX can track which observables are read during render and re-render when they change.

### The Three Pieces

**Store** can receive dependencies in the constructor and have complex `@computed` derivations. But they never do anything — they only hold and derive state.

```ts
class ConversationStore {
  constructor(
    private readonly authSession: { userId: string },
    private readonly offlineStatusStore: { status: 'online' | 'offline' },
  ) {}

  @observable.ref conversations: Conversation[] = [];
  @observable.ref activeConversationId: string | undefined = undefined;
  @observable.ref messages: Message[] = [];
  @observable.ref isLoadingMessages: boolean = false;

  @computed get activeConversation(): Conversation | undefined {
    return this.conversations.find(c => c.id === this.activeConversationId);
  }

  @computed get canSend(): boolean {
    return this.activeConversationId !== undefined
      && this.offlineStatusStore.status === 'online';
  }
}
```

**Presenter** calls APIs, handles errors, writes results into the store via `@action` methods. Receives dependencies through the constructor. After `await`, mutations must be wrapped in `runInAction()` because the `@action` scope ends at the first `await`.

```ts
class ConversationPresenter {
  constructor(
    private readonly api: MessagingService,
    private readonly errorService: ErrorService,
  ) {}

  @action
  async openConversation(store: ConversationStore, conversationId: string) {
    store.activeConversationId = conversationId;
    store.isLoadingMessages = true;

    try {
      const response = await this.api.getMessages(conversationId);
      runInAction(() => {
        store.messages = response.messages;
        store.isLoadingMessages = false;
      });
    } catch (e) {
      runInAction(() => { store.isLoadingMessages = false; });
      this.errorService.errorException(e);
    }
  }
}
```

**Component** is a dumb functional React component. Receives data and callbacks as plain props. No MobX, no stores, no presenters, no API calls. Same input = same output.

```tsx
function ConversationList({ conversations, isLoading, onSelect }) {
  if (isLoading) return <Spinner />;
  return (
    <ul>
      {conversations.map(c => (
        <li key={c.id} onClick={() => onSelect(c.id)}>{c.name}</li>
      ))}
    </ul>
  );
}
```

Something needs to connect store fields to component props, and presenter methods to component callbacks. That's the `create.tsx` — the factory:

```ts
function createConversationList(store, presenter) {
  return observer(() => (
    <ConversationList
      conversations={store.conversations}
      isLoading={store.isLoadingMessages}
      onSelect={id => presenter.openConversation(store, id)}
    />
  ));
}
```

Where does `messagingService` come from? It can't be imported globally — because in fake mode you want a `FakeMessagingService`, and in real mode you want the real one. So it must be passed in from above.

```ts
function installMessaging({ messagingService, errorService, headerController }) {
  const store = new ConversationStore();
  const presenter = new ConversationPresenter(store, messagingService, errorService);
  const ConversationList = createConversationList(store, presenter);

  // ... do something with ConversationList
}
```

And who calls `installMessaging`? The page's `main.tsx`:

```ts
// main.tsx
const bootstrap = getBootstrap();

installMessaging({
  messagingService: bootstrap.services.messagingService,  // real or fake, decided here
  errorService: bootstrap.services.errorService,
  headerController,
});
```

### Questions to Consider

Q: In a normal React app you'd just render `<ConversationList />` somewhere in your JSX tree. But this install function isn't a React component — it's a plain function called at startup. How does `ConversationList` get onto the screen?

The install function mutates a config object that the shell gave it. The sidebar shell doesn't know what features exist. It just renders whatever is in its config slots. The messaging feature doesn't know what the sidebar looks like. It just fills slots.

```ts
function installMessaging({ messagingService, sidebarConfig, headerController }) {
  const store = new ConversationStore();
  const presenter = new ConversationPresenter(store, messagingService);
  const ConversationList = createConversationList(store, presenter);

  // Stuff it into someone else's config.
  sidebarConfig.ConversationList = {
    Button: observer(() => <ChatIcon count={store.totalUnread} />),
    Panel: ConversationList,
  };
}
```

Q: What if a second feature — say, Contacts — also needs the conversations data? Not to display the list, but to show "last message" next to each contact name. How would you make conversations data available to the Contacts feature without exposing the store?

Think about it from the outside. Contacts needs to read conversations but doesn't need to know about `ConversationStore` or `ConversationPresenter`.

Step 1: Define what outsiders are allowed to see — the interface:

```ts
export interface MessagingController {
  readonly conversations: ReadonlyArray<Conversation>;
  readonly totalUnreadCount: number;
  loadConversations(): Promise<void>;
}
```

Step 2: The create function returns an object matching this interface, hiding everything:

```ts
function createMessagingController({ messagingService }): MessagingController {
  const store = new ConversationStore();
  const presenter = new ConversationPresenter(store, messagingService);

  return {
    get conversations() { return store.conversations; },
    get totalUnreadCount() { return store.totalUnread; },
    loadConversations() { return presenter.loadConversations(); },
  };
}
```

Step 3: Create it once, passes it to both features:

```ts
const messagingController = createMessagingController({ messagingService });

installMessaging({ messagingController, sidebarConfig, headerController });
installContacts({ messagingController, presenceController, sidebarConfig });
```

Q: You're debugging. You find this line in a factory: `messagingController.openConversation(conversationId)`. You cmd+click openConversation. Your editor jumps to the `interface MessagingController`, a type definition. Why can't you just cmd+click to the implementation?

The interface and the implementation are in separate packages, and the consumer only imports the interface. TypeScript's "Go to Definition" takes you to the type you imported — and you imported the interface, not the impl. Don't search for the method name — `openConversation` could appear in dozens of files (the interface, the fake, tests, every consumer). Instead, search for the create function that constructs the controller. The naming convention is always `create<Name>`.

### Calling Backend RPCs from Frontend Code

Use bootstrap when:
- Data is needed at initial page load
- Data is the same for all users of a page variant
- Data is small and doesn't change during the session

Use /_ajax when:
- Data is loaded after initial page render
- Data depends on user interaction (search, pagination)
- Data changes during the session (save, update)
- Data is large and should be loaded on demand

What a frontend service does during page load:
1. Receives the route from api-gateway
2. Calls multiple backend RPCs in parallel
3. Builds a `Web2PageOptions` protobuf message containing all the aggregated data
4. Returns `Web2PageOptions` to api-gateway for page assembly

Adding a new /_ajax endpoint:
1. Define the API in proto
2. Implement the handler in the frontend service
3. Run Protogen to generate the TypeScript client
4. Use the generated client in your presenter

## Lazy Resource

As frontend applications grow, the bundle size and initial load time can become significant issues. Standard import statements are eager; they pull code into your bundle and execute it immediately, even if the user never visits that specific tab or opens that modal. To solve this, senior engineers often use the Lazy Resource Pattern. It allows you to define how to build your application’s components without actually building them until they are needed.

Think of a Resource as a "Lazy Box."
1. The box starts empty.
2. It has a `load()` button.
3. Only when you press the button does the box fetch its contents (code, data, services).
4. Once the box is full, it stays full (caching).

```ts
export interface Resource<T> {
  /** Returns the resource, loading it if it hasn't been loaded yet. */
  load(): Promise<T>;
}
```

`LazyResource` implements the "Lazy Box" logic. It ensures that no matter how many times you call `load()`, the expensive work only happens once.

```ts
class LazyResource<T> implements Resource<T> {
  private active: Promise<T> | undefined;

  constructor(private recipe: () => Promise<T>) {}

  async load(): Promise<T> {
    if (!this.active) {
      // Execute the "recipe" and cache the resulting promise
      this.active = this.recipe().catch((err) => {
        this.active = undefined; // Clear cache on error to allow retries
        throw err;
      });
    }
    return this.active;
  }
}
```

### Using Factory

Instead of creating resources manually, we use a `ResourceFactory`. It acts as the authorized creator that wraps the `LazyResource` engine with infrastructure metadata.

```ts
interface ResourceFactory {
  /** Creates a named Resource with built-in tracing */
  create<T>(args: { 
    name: string; 
    load: () => Promise<T> 
  }): Resource<T>;
}
```

> The factory returns the interface `Resource` rather than the concrete class `LazyResource`. The consumer doesn't need to know how the box works; they only need to know that it has a `.load()` button.

Think of the `LazyResource` as the "engine" that handles the state of your "Lazy Box" and the `ResourceFactory` as the "manager" that builds it. When you call `.create()`, the factory doesn't just return a raw engine; it returns one that has been pre-configured with tracing tied to your resource name. This delegation means the `LazyResource` is responsible for ensuring the work only happens once, while the factory is responsible for making sure that work is visible to your monitoring system.

### The Pattern in Action

In a large app, you often have a bootload file. This is the "Composition Root" where you map out your feature's dependencies.
Instead of passing real objects around, you pass Resources.

We start by defining resources. Notice the use of dynamic `import()`, which ensures the code isn't even downloaded until `load()` is called.

```ts
// The Factory creates the LazyResource and injects the 'api_client' trace
const apiClientResource = resourceFactory.create({
  name: 'api_client',
  load: async () => {
    const { ApiClient } = await import('./api/client');
    return new ApiClient();
  },
});

const authServiceResource = resourceFactory.create({
  name: 'auth_service',
  load: async () => {
    const [{ AuthService }, api] = await Promise.all([
      import('./auth/service'),
      apiClientResource.load(), // Depend on another resource
    ]);
    return new AuthService(api);
  },
});
```

Each block is now named and traceable. Every resource is guaranteed to follow the same infrastructure rules (caching, logging, tracing) defined by the factory.

This pattern creates a "pay-as-you-go" architecture where application startup is virtually free. By loading only lightweight `Resource` definitions, you can define hundreds of features without downloading their code or running their logic until they are actually needed.

- You can define 100 features in your bootload file. If the user only ever uses the "Home" tab, the code for the other 99 features is never downloaded, and their initialization logic is never run.
- If your Sidebar, Header, and Main Content all need the `authServiceResource`, they all call `.load()`. The first one starts the engine; the other two simply "wait" on the same promise.
- If a network glitch causes a resource to fail, the catch block resets the cache. The next time the user tries to open that feature, the app will try to download the code again automatically.
