import { create, Whatsapp, Message, SocketState } from "venom-bot"
import pasrsePhoneNumber, { isValidPhoneNumber, parsePhoneNumber} from "libphonenumber-js"

export type QRCode = {
    base64Qr: string
    asciiQR: string
    attempts: number
    urlCode?: string
}

class Sender {
    private client: Whatsapp
    private connected: boolean
    private qr: QRCode

    get isConnected(): boolean{
        return this.connected
    }

    get qrCode(): QRCode{
        return this.qr
    }

    constructor() {
        this.initialize()
    }

    async sendText(to:string, body: string){
        // formato numero 5512982041640@c.us

        if(!isValidPhoneNumber(to, "BR")){
            throw new Error("this number is not valid")
        }

        let phoneNumber = parsePhoneNumber(to, "BR").format("E.164").replace("+", "") as string

        phoneNumber = phoneNumber.includes('@c.us')
            ? phoneNumber : `${phoneNumber}@c.us`

        console.log("phoneNumber", phoneNumber)
        await this.client.sendText(to, body);
    }

    private initialize() {

        const qr = (base64Qr: string, asciiQR: string, attempts: number, ) => {
            this.qr = { base64Qr, asciiQR, attempts }
        }
        const status = (statusSession: string) => {

            this.connected = ["isLogged", "qrReactSuccess", "chatAvailable"].includes(
                statusSession
            )
         }
        const start = (cliente: Whatsapp) => {
            this.client = cliente

            cliente.onStateChange((state) => {
                this.connected = state === SocketState.CONNECTED
            })

            // this.sendText("5517981000817@c.us", "Olá isso é um teste")
        }

        create('ws-sender-dev', qr, status)
            .then((client) => start(client))
            .catch((error) => console.log(error))
    }
}

export default Sender