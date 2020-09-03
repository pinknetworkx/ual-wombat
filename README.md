# UAL for Starteos Authenticator

Forked from [ual-scatter](https://github.com/EOSIO/ual-scatter.git)

This authenticator is meant to be used with [Starteos](https://starteos.io/) and [Universal Authenticator Library](https://github.com/EOSIO/universal-authenticator-library). When used in combination with them, it gives developers the ability to request transaction signatures through Scatter using the common UAL API.

## Getting Started

`yarn add ual-starteos`

#### Dependencies

You must use one of the UAL renderers below.

React - `ual-reactjs-renderer`


PlainJS - `ual-plainjs-renderer`


#### Basic Usage with React

```javascript
import { Starteos } from 'ual-starteos'
import { UALProvider, withUAL } from 'ual-reactjs-renderer'

const exampleNet = {
  chainId: '',
  rpcEndpoints: [{
    protocol: '',
    host: '',
    port: '',
  }]
}

const App = (props) => <div>{JSON.stringify(props.ual)}</div>
const AppWithUAL = withUAL(App)

const starteos = new Starteos([exampleNet], { appName: 'Example App' })

<UALProvider chains={[exampleNet]} authenticators={[starteos]}>
  <AppWithUAL />
</UALProvider>
```
