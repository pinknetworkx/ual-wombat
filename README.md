# UAL for Wombat Authenticator

Forked from [ual-scatter](https://github.com/EOSIO/ual-scatter.git)

This authenticator is meant to be used with [Wombat](https://getwombat.io/) and [Universal Authenticator Library](https://github.com/EOSIO/universal-authenticator-library). When used in combination with them, it gives developers the ability to request transaction signatures through Scatter using the common UAL API.

## Getting Started

`yarn add ual-wombat`

#### Dependencies

You must use one of the UAL renderers below.

React - `ual-reactjs-renderer`


PlainJS - `ual-plainjs-renderer`


#### Basic Usage with React

```javascript
import { Wombat } from 'ual-wombat'
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

const wombat = new Wombat([exampleNet], { appName: 'Example App' })

<UALProvider chains={[exampleNet]} authenticators={[wombat]}>
  <AppWithUAL />
</UALProvider>
```
