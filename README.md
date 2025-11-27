# COSY Frontend

## After cloning this Repository
In order to get you started developing the COSY frontend, please make sure you follow these steps:

### 1. Bun Installation
We use `bun` as our runtime & bundler. For the installation, proceed as follows, depending on your operating system:

#### macOS / Linux
```sh
curl -fsSL https://bun.com/install | bash
```

#### Windows
```sh
powershell -c "irm bun.sh/install.ps1|iex"
```

#### npm
```sh
npm install -g bun
```

You may need to restart your terminal/command line after installation to make sure bun is available to you.

If you encounter any issues, feel free to consult the [bun documentation](https://bun.com/docs/installation) or ask in the GC :)


### 2. Package Installation
We make use of various libraries to make our life easier (duh). Before starting development or behold - trying to start the project, please install all dependencies using the following command:
```sh
bun i
```

### 3. VS Code Setup
While you are technically ready to [start/build the frontend](#), you might want to make your development experience better by following these vs code integrations:

- Install the [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) extension for code linting / formatting support
- Install the [TailwindCSS LintelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension for tailwind class intellisense
- Install the [React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets) extensions which allows you to automatically generate boilerplate component code by typing `tsrfce`

## Starting / Building
To run the frontend with hot-reloading, please run:
```sh
bun run dev
```

If you want to create a final build (why would you want that on your local machine?), run:
```sh
bun run build
```
or with minimization + code splitting:
```sh
bun run build:opt
```

and then start your production build as follows:
```sh
bun run start
```

### Using ShadCN/ui components
In order to use ShadCN/ui we have to first pull them into our repository. To do this, visit [https://ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components)
to get an overview over the available components.

You can then view the documentation (configuration / usage) for individual components and obtain a installation command that should look something like this:
```sh
bunx --bun shadcn@latest add button
```

Running this command in the repositorys root directory will install the component (e.g. `button.tsx`) into the `./src/components/ui/` directory.
You can now import the component by importing from `@components/ui/[component name].tsx`.

The advantage of using ShadCN is that you can freely modify components if you wish to. Please remember to create a copy of the `[component name].tsx` if you do not
wish all components of the type to be affected by your modification.

Please place any modified components under `./src/components/custom/[modified component name].tsx` in order to separate pure ShadCN components from modified ones.


### Common Pitfalls
#### Tanstack Router Error
Hot reloading for new routes does not work currently. When you run `bun run dev`, tanstack router generates a new route tree for you which should fix the issue.
If you need to regenerate the route tree while bun is running in development mode, please execute:
```sh
bun run tsr:gen
```

to regenerate the route tree.
