import {
  Agent,
  ConnectionEventTypes,
  ConnectionStateChangedEvent,
  CredentialEventTypes,
  CredentialState,
  CredentialStateChangedEvent,
  DidExchangeState,
  OutOfBandRecord,
} from "@aries-framework/core";

export const setupConnectionListener = (
  agent: Agent,
  outOfBandRecord: OutOfBandRecord,
  cb: (...args: any) => {}
) => {
  agent.events.on<ConnectionStateChangedEvent>(
    ConnectionEventTypes.ConnectionStateChanged,
    async ({ payload }) => {
      if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return;
      if (payload.connectionRecord.state === DidExchangeState.Completed) {
        // the connection is now ready for usage in other protocols!
        console.log(
          `Connection for out-of-band id ${outOfBandRecord.id} completed`
        );
        // Custom business logic can be included here
        // In this example we can send a basic message to the connection, but
        // anything is possible
        await cb(payload.connectionRecord.id);
      }
    }
  );
};

export const setupCredentialListener = (holder: Agent) => {
  holder.events.on<CredentialStateChangedEvent>(
    CredentialEventTypes.CredentialStateChanged,
    async ({ payload }) => {
      switch (payload.credentialRecord.state) {
        case CredentialState.OfferReceived:
          console.log("received a credential");
          // custom logic here
          await holder.credentials.acceptOffer({
            credentialRecordId: payload.credentialRecord.id,
          });

        case CredentialState.Done:
          console.log(
            `Credential for credential id ${payload.credentialRecord.id} is accepted`
          );
          // For demo purposes we exit the program here.
          process.exit(0);
      }
    }
  );
};
