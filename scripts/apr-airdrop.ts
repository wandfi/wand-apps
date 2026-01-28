import { mapValues } from "es-toolkit";


const data = {
    '0x2aa8074D598A25E4B3b99C691B99bd5B186cfd52': 30000,
    '0x751CE0B0Ed681421c77530f5CC00Bf3A3A2C7bfC': 5936.71,
    '0x00d2c498fb20d91d094B49B134088Ef746d09C1f': 100.0001,
    '0x69b29756A231F771cc59E1CCA2A0ebb313F70F49': 0.1,
    '0xFE18Aa1EFa652660F36Ab84F122CD36108f903B6': 0.1,
    '0xc97B447186c59A5Bb905cb193f15fC802eF3D543': 0.01,
}
const total = 30000 + 5936.71 + 100.0001 + 0.1 + 0.1 + 0.01
const data2 = mapValues(data, (num) => 1000 * num / total)

console.info(data2)
export { };
