import bonjour from "bonjour";

const svc = bonjour()

const publishService = (name: string, port: number, fingerprint: string) => {
  svc.publish({
    name: name,
    type: 'fcl',
    port: port,
    txt: {
      fingerprint: fingerprint
    }
  })
}

const replaceService = (name: string, port: number, fingerprint: string) => {
  svc.unpublishAll(() => {
    publishService(name, port, fingerprint)
  })
}

export {
  publishService,
  replaceService
}