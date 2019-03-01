export class Playbook {
    
    constructor() { }

    device: string;
    command: string;
    version: string;

    protected static SInit = (() => {
        Playbook.prototype.device = "routers";
        Playbook.prototype.command = "backupDevice";
    })();
}

