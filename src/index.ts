import Holder from "./base/Holder";
import Issuer from "./base/Issuer";
import {
  setupConnectionListener,
  setupCredentialListener,
} from "./utils/listenEven";

(async () => {
  const alice = new Issuer("Alice", 3001);
  const bob = new Holder("Bob", 3002);

  await alice.initializeAgent();
  await bob.initializeAgent();

  const issuingCredential = async (connectionId: string) => {
    // console.log("Registering the schema...");
    // const schema = await alice.registerSchema();
    // console.log("Registering the credential definition...");
    // const credentialDefinition = await alice.registerCredentialDefinition(
    //   schema
    // );
    console.log("Issuing the credential...");
    await alice.issueCredential(
      "P55pMWgLeZtmjLweVLbrJC:3:CL:7:default",
      connectionId
    );
  };

  setupCredentialListener(bob.agent);

  console.log("Creating the invitation as Alice...");
  const { invitationUrl, outOfBandRecord } = await alice.createInvitation();

  setupConnectionListener(alice.agent, outOfBandRecord, issuingCredential);

  console.log("Accepting the invitation as Bob...");
  await bob.receiveInvitation(invitationUrl);
})();
