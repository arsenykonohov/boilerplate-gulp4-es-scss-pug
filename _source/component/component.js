//export class TapeMachine {
module.exports = class TapeMachine {
    constructor() {
        this.recordedMessage = "";
    }
    rec(message) {
        this.recordedMessage = message;
    }
    play() {
        console.log(this.recordedMessage);
    }
}