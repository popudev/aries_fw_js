import {
  InitConfig,
  Agent,
  WsOutboundTransport,
  HttpOutboundTransport,
  ConnectionEventTypes,
  ConnectionStateChangedEvent,
  DidExchangeState,
  OutOfBandRecord,
} from "@aries-framework/core";
import { agentDependencies, HttpInboundTransport } from "@aries-framework/node";
import fetch from "node-fetch";

const getGenesisTransaction = async (url: string) => {
  const response = await fetch(url);
  return await response.text();
};

const initializeAliceAgent = async () => {
  const genesisTransactionsVon = await getGenesisTransaction(
    "http://localhost:9000/genesis"
  );

  const config: InitConfig = {
    label: "demo-agent-alice",
    walletConfig: {
      id: "AliceAgent",
      key: "demoagentalice000000000000000000",
    },
    publicDidSeed: "demoagentalice000000000000000000",
    indyLedgers: [
      {
        id: "von-network",
        isProduction: false,
        genesisTransactions: genesisTransactionsVon,
      },
    ],
    autoAcceptConnections: true,
    endpoints: ["http://localhost:3001"],
  };

  const agent = new Agent(config, agentDependencies);

  agent.registerOutboundTransport(new WsOutboundTransport());
  agent.registerOutboundTransport(new HttpOutboundTransport());
  agent.registerInboundTransport(new HttpInboundTransport({ port: 3001 }));

  await agent.initialize();

  return agent;
};

const initializeBobAgent = async () => {
  const config: InitConfig = {
    label: "demo-agent-bob",
    walletConfig: {
      id: "BobAgent",
      key: "demoagentbob00000000000000000000",
    },
    autoAcceptConnections: true,
  };

  const agent = new Agent(config, agentDependencies);

  agent.registerOutboundTransport(new WsOutboundTransport());
  agent.registerOutboundTransport(new HttpOutboundTransport());

  await agent.initialize();

  return agent;
};

const createInvitation = async (agent: Agent) => {
  const outOfBandRecord = await agent.oob.createInvitation();
  return {
    invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({
      domain: "https://example.org",
    }),
    outOfBandRecord,
  };
};

const receiveInvitation = async (agent: Agent, invitationUrl: string) => {
  const { outOfBandRecord } = await agent.oob.receiveInvitationFromUrl(
    invitationUrl
  );
  return outOfBandRecord;
};

const setupConnectionListener = (
  agent: Agent,
  outOfBandRecord: OutOfBandRecord,
  name: string
) => {
  agent.events.on<ConnectionStateChangedEvent>(
    ConnectionEventTypes.ConnectionStateChanged,
    ({ payload }) => {
      if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return;
      if (payload.connectionRecord.state === DidExchangeState.Completed) {
        console.log(name);
        console.log(`Connection id ${outOfBandRecord.id} completed`);
      }
    }
  );
};

const run = async () => {
  console.log("Initializing Bob agent...");
  const bob = await initializeBobAgent();

  console.log("Initializing Alice agent...");
  const alice = await initializeAliceAgent();

  console.log("Creating the invitation as Alice...");
  const { outOfBandRecord, invitationUrl } = await createInvitation(alice);
  setupConnectionListener(alice, outOfBandRecord, "Alice: ");

  console.log("Accepting the invitation as Bob...");
  const outOfBandRecordBod = await receiveInvitation(bob, invitationUrl);
  setupConnectionListener(bob, outOfBandRecordBod, "Bob: ");

  // console.log("alice: ", alice);
};

run();
