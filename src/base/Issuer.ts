import {
  InitConfig,
  Agent,
  HttpOutboundTransport,
  AutoAcceptCredential,
} from "@aries-framework/core";
import { agentDependencies, HttpInboundTransport } from "@aries-framework/node";
import { Schema } from "indy-sdk";

import { getGenesisTransaction } from "../utils/fetch";
import AgentBase from "./AgentBase";

class Issuer extends AgentBase {
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
        id: this.name + "agent",
        key: "demoagentalice000000000000000000",
      },
      publicDidSeed: "demoagentalice000000000000000000",
      indyLedgers: [
        {
          id: "von-network",
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

  public registerSchema = async () =>
    this.agent.ledger.registerSchema({
      attributes: ["name", "age"],
      name: "Identity",
      version: "1.0",
    });

  public registerCredentialDefinition = async (schema: Schema) =>
    this.agent.ledger.registerCredentialDefinition({
      schema,
      supportRevocation: false,
      tag: "default",
    });

  public issueCredential = async (
    credentialDefinitionId: string,
    connectionId: string
  ) =>
    this.agent.credentials.offerCredential({
      protocolVersion: "v1",
      connectionId,
      credentialFormats: {
        indy: {
          credentialDefinitionId,
          attributes: [
            { name: "name", value: "Jane Doe" },
            { name: "age", value: "23" },
          ],
        },
      },
    });
}

export default Issuer;
