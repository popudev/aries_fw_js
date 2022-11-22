import {
  InitConfig,
  Agent,
  HttpOutboundTransport,
  AutoAcceptCredential,
} from "@aries-framework/core";
import { agentDependencies, HttpInboundTransport } from "@aries-framework/node";
import { getGenesisTransaction } from "../utils/fetch";
import AgentBase from "./AgentBase";

class Holder extends AgentBase {
  public constructor(name: string, port: number) {
    super(name, port);
  }

  public initializeAgent = async () => {
    const genesisTransactions = await getGenesisTransaction(
      "http://localhost:9000/genesis"
    );
    const config: InitConfig = {
      label: this.name,
      walletConfig: {
        id: this.name + "23",
        key: "demoagentbob00000000000000000000",
      },
      indyLedgers: [
        {
          id: "von-network-1",
          isProduction: false,
          genesisTransactions: genesisTransactions,
        },
      ],
      autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
      autoAcceptConnections: true,
      endpoints: [`http://localhost:${this.port}`],
    };

    this.agent = new Agent(config, agentDependencies);
    this.agent.registerOutboundTransport(new HttpOutboundTransport());
    this.agent.registerInboundTransport(
      new HttpInboundTransport({ port: this.port })
    );

    console.log(`Initializing ${this.name} agent...`);
    await this.agent.initialize();
  };
}

export default Holder;
