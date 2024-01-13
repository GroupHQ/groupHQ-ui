_This README is a work in progress. Some steps may be incomplete or missing_

# GroupHQ UI

The GroupHQ UI serves as the front-end for the GroupHQ application, managing user authentication and providing an
interface for users to view, join, and leave dynamically generated groups.

## Contents

- [Pre-requisites](#pre-requisites)
- [Development server](#development-server)
- [Code scaffolding](#code-scaffolding)
- [Build](#build)
- [Running unit tests](#running-unit-tests)
- [Adding unit tests](#adding-unit-tests)
- [Running end-to-end tests](#running-end-to-end-tests)
- [Adding end-to-end tests](#adding-end-to-end-tests)
- [Starting up the backend](#starting-up-the-backend)
- [Checks to Pass](#checks-to-pass)
- [Further help](#further-help)

## Pre-requisites

- [Node.js](https://nodejs.org/en/) (v14.15.4)
- [Angular CLI](https://angular.io/cli) (v11.2.0)
- An IDE with Angular & TypeScript support
- Git. [Download here](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git). For Windows users, install
  Git using [Git For Windows](https://gitforwindows.org/)
- Recommended to install a Bash terminal. Linux and Mac users should have this by default. Windows users can install
  Git Bash using [Git For Windows](https://gitforwindows.org/).
- Kubeconform (for validating Kubernetes manifests). [Download here](https://github.com/yannh/kubeconform?tab=readme-ov-file#Installation)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you
change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use
`ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Adding unit tests

For any new features or bug fixes, add unit tests to ensure that the change works as expected. The following testing
strategy is followed in this project:

1. For service classes, test each public method in the class.
2. If a service has dependencies, mock the dependencies and test the service's public methods.
3. If a service is effectively a wrapper around an external dependency, do not test the service. This type of
   verification would be better suited for an end-to-end test. See [Adding End-to-end tests](#adding-end-to-end-tests)
   for more details.
4. If a service has dependencies and depends on those dependencies for most of its public methods, then this type of
   service is more suited for an integration test involving those dependencies.
5. For components, test the component's public methods as well as the component's templating logic (e.g. verifying an
   element exists during a particular state).
6. For components that have dependencies, mock those dependencies out to focus on testing the component's logic. Make
   sure that the mocks you create accurately reflect the behavior of the dependencies that the component relies on. The
   advantage of this approach is you only need to worry about what the component needs, and not what the services need to
   be properly used in a testing environment.

## Running end-to-end tests

End-to-end (E2E) tests are run automatically when opening a pull request. These tests are run in a separate testing
environment, testing any changes provided by the pull request. The results of these tests will be accessible
through a link attached to the commit status once the tests have completed.

## Adding end-to-end tests

For any user-facing changed, add an end-to-end (E2E) test to ensure that the change works as expected.
End-to-end tests are hosted on another repository. Check out the README there for more information,
including on how to add a new end-to-end test.

[GroupHQ Continuous Testing Test Suite](https://github.com/GroupHQ/grouphq-continuous-testing-test-suite)

## Starting up the backend

To view and interact with groups, the backend must be running. For instructions on how to start up the backend
and its dependencies, check out the README in the [GroupHQ Deployment Repository](https://github.com/GroupHQ/groupHQ-deployment).

If you want more fine-grained control over which backend services are running, you can start up certain backend services
individually. Check out the README in the following backend repositories for more information:

- [Edge Service](https://github.com/GroupHQ/edge-service)
- [Group Sync](https://github.com/GroupHQ/group-sync)
- [Group Service](https://github.com/GroupHQ/group-service)

## Checks to Pass

When pushing a commit to any branch, the following checks are run:

- **Dependency Vulnerability Check:** Checks for any vulnerabilities in the dependencies of the project using
  `npm audit`.
- **Code Style:** Checks for any code style violations using ESLint via `ng lint`.
- **CSS Style:** Checks for any CSS style violations using Stylelint via `npx stylelint "**/*.css"`.
- **SCSS Style:** Checks for any SCSS style violations using Stylelint via `npx stylelint "**/*.scss"`.
- **Builds Successfully:** Builds the project using `ng build`.
- **Unit Tests:** Runs all unit tests in the project using Karma.
- **Code Vulnerability Scanning:** Checks for any code vulnerabilities in project build using Anchore.
- **Manifest Validation:** Any changes to Kubernetes manifests under the `k8s` folder must pass validation.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli)
page.
