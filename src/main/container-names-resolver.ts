import { TechKey, techKey } from '../shared/tech'
import { dockerServicesByPort, stopContainer } from './docker'

// the service behind a published port: a display name + an opaque handle to act on it
export interface ResolvedContainer {
  name: string
  handle: string // passed back to `stop` (e.g. docker container id)
}

// Some processes are proxies that hide the real service behind a port (a Docker VM
// publishes every container under one `com.docker.backend`). A resolver names the
// service behind each port and can stop it by handle. Register one per tech; add
// others (podman, …) without touching callers.
export interface ContainerNamesResolver {
  resolve(ports: number[]): Promise<Map<number, ResolvedContainer>>
  stop(handle: string): Promise<{ ok: boolean; error?: string }>
}

const docker: ContainerNamesResolver = {
  async resolve(ports) {
    const out = new Map<number, ResolvedContainer>()
    const services = await dockerServicesByPort()
    for (const port of ports) {
      const svc = services.get(port)
      if (svc) out.set(port, { name: svc.name, handle: svc.id })
    }
    return out
  },
  stop: (handle) => stopContainer(handle)
}

const RESOLVERS: Partial<Record<TechKey, ContainerNamesResolver>> = { docker }

// the resolver for a group's command, or undefined if its tech needs no resolving
export const containerNamesResolverFor = (command: string): ContainerNamesResolver | undefined => {
  const tech = techKey(command)
  return tech ? RESOLVERS[tech] : undefined
}

// true when a command is a container-service proxy (docker, …) we can resolve/stop
export const isContainerService = (command: string): boolean =>
  containerNamesResolverFor(command) !== undefined
