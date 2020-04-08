import { PermissionsAndroid, Platform, NativeModules, NativeEventEmitter } from "react-native";
import BleManager, { start, PeripheralInfo } from 'react-native-ble-manager';
import { EventEmitter2 } from "eventemitter2";
import { bytesToString } from 'convert-string';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const PERMISSION = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;

interface ParamInterface {
    (result: any): void
}

export interface Peripheral {
    name: string,
    id: string,
    serviceUUIDs: string[],
    isConnectable: boolean,
}

export interface Properties {
    "Read"?: "Read",
    "Indicate"?: "Indicate",
    "Write"?: "Write",
    "Notify"?: "Notify"
}
export interface Characteristic {
    properties: Properties,
    characteristic: string,
    service: string
}

export interface PeripheralInfo2 {
    characteristics: Characteristic[]
}

class BLEController extends EventEmitter2 {
    private _started: boolean = false;
    private _scanning: boolean = false;
    private _wait_scan_end?: (peripherals: Peripheral[]) => void;

    private _peripherals: Peripheral[] = [];

    private peripheral_discovered: ParamInterface = (peripheral) => {
        const {advertising} = peripheral;
        if(!advertising || !peripheral.name) return;
        if(!peripheral.name.indexOf || peripheral.name !== "DSD TECH") return;

        if(!!advertising.isConnectable && !this._peripherals.find(p => p.name === peripheral.name)) {
            const new_p = {
                name: peripheral.name,
                id: peripheral.id,
                serviceUUIDs: advertising.serviceUUIDs||[],
                isConnectable: advertising.isConnectable
            };
            this.emit("peripheral_discovered", new_p);
            this._peripherals.push(new_p);
            console.warn(new_p);
        }
    }

    private scan_stopped: ParamInterface = () => {
        this._scanning = false;
        try {
            this._wait_scan_end && this._wait_scan_end(this._peripherals);
        } catch(e) {

        }
        this._wait_scan_end = undefined;
    }

    private peripheral_disconnected: ParamInterface = () => {
        
    }

    private did_update_value_for_characteristic: ParamInterface = ({ value, peripheral, characteristic, service }) => {
        console.warn({service, characteristic, value: bytesToString(value)});
    }

    constructor() {
        super();

        bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.peripheral_discovered );
        bleManagerEmitter.addListener('BleManagerStopScan', this.scan_stopped );
        bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.peripheral_disconnected );
        bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.did_update_value_for_characteristic );
    }

    checkPermission = async () => {
        //TODO add a tracker on the starts call to prevent multiple ones
        var started = this._started;
        if(!started) await BleManager.start();
        this._started = true;

        if (Platform.OS === 'android' && Platform.Version >= 23) {
            var result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
            if(!result) {
                result = await PermissionsAndroid.request(PERMISSION) == "granted";
            }

            return result;
        } else {
            return true;
        }
    }

    scan: () => Promise<Peripheral[]> = async () =>  {
        if(this._scanning) throw "already started";

        this._scanning = true;

        const result = await this.checkPermission();
        if(!result) throw "Not permitted";

        return new Promise((resolve) => {
            this._peripherals = [];
            this._wait_scan_end = resolve;
            BleManager.scan([], 5, false);
        });
    }

    connect = async (peripheral: Peripheral) => {
        const connected: any = await BleManager.connect(peripheral.id);
        return !!connected;
    }

    disconnect = async (peripheral: Peripheral) => {
        try {
            const result: any = await BleManager.disconnect(peripheral.id, false);
            return !!result;
        } catch(e) {
            console.warn(e);
            return false;
        }
    }

    retrieveServices = async (peripheral: Peripheral) => {
        return BleManager.retrieveServices(peripheral.id) as Promise<PeripheralInfo2>;
    }

    startNotification = (peripheral: Peripheral, characteristic: Characteristic) => {
        return BleManager.startNotification(peripheral.id, characteristic.service, characteristic.characteristic);
    }

    stopNotification = (peripheral: Peripheral, characteristic: Characteristic) => {
        return BleManager.stopNotification(peripheral.id, characteristic.service, characteristic.characteristic);
    }
}

export const instance = new BLEController();