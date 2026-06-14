import { TechKey, techKey } from '../shared/tech'
import { dockerServicesByPort } from './docker'

// Some processes are proxies that hide the real service behind a port (a Docker VM
// publishes every container under one `com.docker.backend`). A resolver asks the
// proxy which service owns each port and returns a `port -> name` map; the caller
// decides what to do with it. Register one per tech; add others (podman, …)
// without touching the caller.
export interface ContainerNamesResolver {
  // names for the ports it can resolve; ports it can't are simply absent
  resolve(ports: number[]): Promise<Map<number, string>>
}

const docker: ContainerNamesResolver = {
  async resolve(ports) {
    const names = new Map<number, string>()
    const services = await dockerServicesByPort()
    for (const port of ports) {
      const svc = services.get(port)
      if (svc) names.set(port, svc.name)
    }
    return names
  }
}

const RESOLVERS: Partial<Record<TechKey, ContainerNamesResolver>> = { docker }

// the resolver for a group's command, or undefined if its tech needs no resolving
export const containerNamesResolverFor = (command: string): ContainerNamesResolver | undefined => {
  const tech = techKey(command)
  return tech ? RESOLVERS[tech] : undefined
}
