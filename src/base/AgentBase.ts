import { Agent } from "@aries-framework/core";

class AgentBase {
  public port: number;
  public name: string;
  public agent: Agent;

  public constructor(name: string, port: number) {
    this.name = name;
    this.port = port;
    // this.agent = new Agent();
  }

  public createInvitation = async () => {
    const outOfBandRecord = await this.agent.oob.createInvitation();
    return {
      invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({
        domain: "https://example.org",
      }),
      outOfBandRecord,
    };
  };

  public receiveInvitation = async (invitationUrl: string) => {
    const { outOfBandRecord } = await this.agent.oob.receiveInvitationFromUrl(
      invitationUrl
    );
    return outOfBandRecord;
  };
}

export default AgentBase;
