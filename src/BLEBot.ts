import { Peripheral, BLEController } from "./BLEController";
import { EventEmitter2 } from "eventemitter2";

export enum BLEBotStatus {
  STOPPED,
  STARTING,
  STARTED,
  STOPPING
};

export class BLEBot_ extends EventEmitter2 {
  private _peripheral: Peripheral|null = null;
  private _status: BLEBotStatus = BLEBotStatus.STOPPED;

  constructor() {
    super();

    BLEController.addListener("peripheral_disconnected", this._peripheral_disconnected);
    BLEController.addListener("update", this._update);
  }

  private _peripheral_disconnected = (peripheral: string) => {
    if(null != this._peripheral && this._peripheral.id === peripheral) {
      this.setStatus(BLEBotStatus.STOPPED);
    }
  }

  private _update = (update: string) => {
    this.emit("update", update);
  }

  public async start() {
    if(this._status !== BLEBotStatus.STOPPED) {
      return false;
    }

    this.setStatus(BLEBotStatus.STARTING);
    this.starting().then(peripheral => {
      this._peripheral = peripheral;
      this.setStatus(this._peripheral ? BLEBotStatus.STARTED : BLEBotStatus.STOPPED);
    }).catch(err => {
      this.setStatus(BLEBotStatus.STOPPED);
    })
  }

  public status = () => this._status;

  public setStatus(status: BLEBotStatus) {
    this._status = status;
    console.warn({status});
    this.emit("status", this._status);
  }

  private async starting() {
    const permission = BLEController.checkPermission()
    if(!permission) throw "Not allowed";
    
    const devices = await BLEController.scan();
    if(!devices || devices.length <= 0) return null;
    const peripheral = devices[0];

    try {
      await BLEController.disconnect(peripheral);
    } catch(e) {

    }

    const connected = await BLEController.connect(peripheral);
    if(!connected) return null;

    try {
      const services = await BLEController.retrieveServices(peripheral);
      const notification = services ? services.characteristics.find(c => "Notify" === c.properties.Notify) : null;
  
      if(notification) {
        await BLEController.startNotification(peripheral, notification);
  
        return peripheral;
      } else {
        const final_connected = BLEController.isPeripheralConnected(peripheral);
        if(final_connected) BLEController.disconnect(peripheral);
      }  
    } catch(e) {
      console.warn("starting error", e);
    }

    return null;
  }
}

export const BLEBot = new BLEBot_();