<img src="https://user-images.githubusercontent.com/695698/217101686-88cc3f69-599a-481c-a18e-b9bc220456ba.png" width="450"/>

# Simple & Secure ‍Auth & Identity

![License](https://img.shields.io/github/license/rollupid/rollupid)
[![Discord](https://img.shields.io/discord/790660849471062046?label=Discord)](https://discord.gg/UgwAsJf6C5)

#### Build Status

##### Platform

![](https://github.com/rollupid/rollupid/actions/workflows/main-galaxy.yaml/badge.svg)
![](https://github.com/rollupid/rollupid/actions/workflows/main-edges.yaml/badge.svg)
![](https://github.com/rollupid/rollupid/actions/workflows/main-starbase.yaml/badge.svg)
![](https://github.com/rollupid/rollupid/actions/workflows/main-access.yaml/badge.svg)
![](https://github.com/rollupid/rollupid/actions/workflows/main-address.yaml/badge.svg)
![](https://github.com/rollupid/rollupid/actions/workflows/main-account.yaml/badge.svg)
![](https://github.com/rollupid/rollupid/actions/workflows/main-images.yaml/badge.svg)

##### Apps

![](https://github.com/rollupid/rollupid/actions/workflows/main-profile.yaml/badge.svg)
![](https://github.com/rollupid/rollupid/actions/workflows/main-console.yaml/badge.svg)
![](https://github.com/rollupid/rollupid/actions/workflows/main-passport.yaml/badge.svg)

##### Packages

TODO

## What is Rollup?

Rollup is authorization infrastructure for your apps so you can build great relationships with your users. For more information please checkout our [website](https://rollup.id) and [docs](https://docs.rollup.id).

## Rollup Monorepo Tour

Let's take a look around at the Rollup Monorepo layout...

## Platform

The [platform/](platform) directory is where all the core identity services are located. The Rollup platform is organized by "local-first" (or logically local) nodes (accounts, address, account, and more) organized in a graph by the Galaxy service.

## Apps

The [apps/](apps) directory is where the presentation layer applications (or backend for frontends) live. These apps include the Profile user experience as well as the Developer Console app.

## Packages

The [packages/](packages/) directory contains our libraries and other share components.

### Docs

The [docs/](docs/) directory contains the developer documentation portal.

## Develop

### Configuration

Please use the following tools and versions when developing with this repository:

- Node.js v17+

#### NIX ENV

Install NIX and run `nix-build` to install nix packages and `nix-shell` to execute a shell with a fully configured development environment.

Note that docker doesn't fully work using nix packages.

#### Developing

This monorepo is managed by Yarn workspaces and nested workspaces. You can run `yarn` commands (i.e., `yarn dev`) to run all the platform services and dependencies together. Applications require more resources so it is recommended to run them individually.

## Contributing

We are happy to accept contributions of all sized. Feel free to submit a pull request.

Also checkout our [contributing guidelines](https://docs.rollup.id).
