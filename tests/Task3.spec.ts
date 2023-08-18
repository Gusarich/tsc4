import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { BitString, Builder, Cell, Slice, beginCell, toNano } from 'ton-core';
import { Task3 } from '../wrappers/Task3';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import * as fs from 'fs';

describe('Task3', () => {
    let code: Cell;

    function loadBitstring(s: Slice): string {
        let r = '';
        while (true) {
            while (s.remainingBits > 0) {
                r += s.loadBit() ? '1' : '0';
            }
            if (s.remainingRefs > 0) {
                s = s.loadRef().beginParse();
            } else {
                break;
            }
        }
        return r;
    }

    function storeBitstring(b: Builder, s: string): Cell {
        if (b.availableBits >= s.length) {
            for (const c of s) {
                b.storeBit(parseInt(c));
            }
            return b.endCell();
        }
        for (const c of s.substring(0, 1023)) {
            b.storeBit(parseInt(c));
        }
        return b.storeRef(storeBitstring(beginCell(), s.substring(1023))).endCell();
    }

    function makeid(length: number): string {
        let result = '1';
        for (let i = 0; i < length; i++) {
            result += Math.round(Math.random() * 1).toString();
        }
        return result;
    }

    function genRandCell(): Cell {
        const length = Math.floor(Math.random() * 200);
        return storeBitstring(beginCell(), makeid(length));
    }

    beforeAll(async () => {
        code = await compile('Task3');
    });

    let blockchain: Blockchain;
    let task3: SandboxContract<Task3>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        blockchain.verbosity = {
            vmLogs: 'vm_logs_full',
            print: false,
            blockchainLogs: false,
            debugLogs: false,
        };

        task3 = blockchain.openContract(Task3.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task3.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task3.address,
            deploy: true,
            success: true,
        });
    });

    it('should work on empty input', async () => {
        expect(await task3.getReplace(BigInt('0b1'), BigInt('0b0'), Cell.EMPTY)).toEqualCell(Cell.EMPTY);
    });

    it('should work', async () => {
        const s = '101010101';
        const oldS = '101';
        const newS = '100';
        let b = beginCell();
        for (const c of s) {
            b.storeBit(parseInt(c));
        }
        const res = loadBitstring(
            (await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), b.endCell())).beginParse()
        );
        expect(res).toEqual(s.replaceAll(oldS, newS));
    });

    it('should work 1', async () => {
        const s = '1010101010';
        const oldS = '101';
        const newS = '100';
        let b = beginCell();
        for (const c of s) {
            b.storeBit(parseInt(c));
        }
        const res = loadBitstring(
            (await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), b.endCell())).beginParse()
        );
        expect(res).toEqual(s.replaceAll(oldS, newS));
    });

    it('should work 2', async () => {
        const s = '10101010101';
        const oldS = '101';
        const newS = '100';
        let b = beginCell();
        for (const c of s) {
            b.storeBit(parseInt(c));
        }
        const res = loadBitstring(
            (await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), b.endCell())).beginParse()
        );
        expect(res).toEqual(s.replaceAll(oldS, newS));
    });

    it('should work 3', async () => {
        const s = '101010101010';
        const oldS = '101';
        const newS = '100';
        let b = beginCell();
        for (const c of s) {
            b.storeBit(parseInt(c));
        }
        const res = loadBitstring(
            (await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), b.endCell())).beginParse()
        );
        expect(res).toEqual(s.replaceAll(oldS, newS));
    });

    it('should work 4', async () => {
        const s = '1010101010101';
        const oldS = '101';
        const newS = '100';
        let b = beginCell();
        for (const c of s) {
            b.storeBit(parseInt(c));
        }
        const res = loadBitstring(
            (await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), b.endCell())).beginParse()
        );
        expect(res).toEqual(s.replaceAll(oldS, newS));
    });

    it.skip('should work on strange cells', async () => {
        {
            const c = beginCell()
                .storeUint(77240897394, 100)
                .storeRef(
                    beginCell()
                        .storeUint(77240897394, 100)
                        .storeRef(
                            beginCell()
                                .storeUint(77240897394, 100)
                                .storeRef(
                                    beginCell().storeUint(77240897394, 100).storeRef(beginCell().endCell()).endCell()
                                )
                                .endCell()
                        )
                        .endCell()
                )
                .endCell();
            const res = loadBitstring((await task3.getReplace(BigInt('0b110'), BigInt('0b10000'), c)).beginParse());
            expect(res).toEqual(
                '0000000000000000000000000000000000000000000000000000000000000001000111111011111010101000111101110010000000000000000000000000000000000000000000000000000000000000000100011111101111101010100011110111001000000000000000000000000000000000000000000000000000000000000000010001111110111110101010001111011100100000000000000000000000000000000000000000000000000000000000000001000111111011111010101000111101110010'.replaceAll(
                    '110',
                    '10000'
                )
            );
        }

        {
            const c = beginCell()
                .storeUint(77240897394, 100)
                .storeRef(
                    beginCell()
                        .storeRef(
                            beginCell()
                                .storeUint(77240897394, 100)
                                .storeRef(
                                    beginCell().storeUint(77240897394, 100).storeRef(beginCell().endCell()).endCell()
                                )
                                .endCell()
                        )
                        .endCell()
                )
                .endCell();
            const res = loadBitstring((await task3.getReplace(BigInt('0b110'), BigInt('0b10000'), c)).beginParse());
            expect(res).toEqual(
                '000000000000000000000000000000000000000000000000000000000000000100011111101111101010100011110111001000000000000000000000000000000000000000000000000000000000000000010001111110111110101010001111011100100000000000000000000000000000000000000000000000000000000000000001000111111011111010101000111101110010'.replaceAll(
                    '110',
                    '10000'
                )
            );
        }

        {
            const c = beginCell().storeUint(1291, 128).storeRef(beginCell().storeUint(10815, 14).endCell()).endCell();
            expect(await task3.getReplace(373n, 511n, c)).toEqualCell(beginCell().storeUint(21233215, 142).endCell());
        }

        {
            const c = beginCell().storeUint(21, 5).storeRef(beginCell().storeUint(21, 6).endCell()).endCell();
            expect(await task3.getReplace(5n, 7n, c)).toEqualCell(beginCell().storeUint(1911, 11).endCell());
        }
    });

    it.skip('should work for random strange cells', async () => {
        for (let i = 0; i < 100; i++) {
            let c = genRandCell();
            const length = Math.floor(Math.random() * 50);
            for (let j = 0; j < length; j++) {
                c = genRandCell().asBuilder().storeRef(c).endCell();
            }
            const s = loadBitstring(c.asSlice());
            const flag = '1' + makeid(Math.ceil(Math.random() * 10));
            const value = '1' + makeid(Math.ceil(Math.random() * 10));
            const res = loadBitstring(
                (await task3.getReplace(BigInt('0b' + flag), BigInt('0b' + value), c)).beginParse()
            );
            expect(res).toEqual(s.replaceAll(flag, value));
        }
    });

    it('should work on different strings (simple)', async () => {
        {
            const s = '1001110011';
            const oldS = '110';
            const newS = '10';
            let b = beginCell();
            for (const c of s) {
                b.storeBit(parseInt(c));
            }
            const res = loadBitstring(
                (await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), b.endCell())).beginParse()
            );
            expect(res).toEqual(s.replaceAll(oldS, newS));
        }

        {
            const s = makeid(3000);
            const oldS = '1';
            const newS = '11111111111111111111111111111111';
            const res = loadBitstring(
                (
                    await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), storeBitstring(beginCell(), s))
                ).beginParse()
            );
            expect(res).toEqual(s.replaceAll(oldS, newS));
        }
    });

    it('should work a little bit harder', async () => {
        const s =
            '1010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010';
        const oldS = '101';
        const newS = '100';
        let b = beginCell();
        for (const c of s) {
            b.storeBit(parseInt(c));
        }
        const res = loadBitstring(
            (await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), b.endCell())).beginParse()
        );
        expect(res).toEqual(s.replaceAll(oldS, newS));
    });

    it('should work on different strings', async () => {
        const s = '0101010010101110100110111100101001010101001101101000000010101000010100100';
        const oldS = '110';
        const newS = '1111111';
        let b = beginCell();
        for (const c of s) {
            b.storeBit(parseInt(c));
        }
        const res = loadBitstring(
            (await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), b.endCell())).beginParse()
        );
        expect(res).toEqual(s.replaceAll(oldS, newS));
    });

    it('should work on short random strings', async () => {
        for (let i = 0; i < 50; i++) {
            const s = makeid(Math.floor(Math.random() * 100) + 30);
            let x = Math.floor(Math.random() * 5) + 1;
            let y = Math.floor(Math.random() * 5) + 1;
            const oldS = '1' + makeid(x);
            const newS = '1' + makeid(y);

            const res = loadBitstring(
                (
                    await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), storeBitstring(beginCell(), s))
                ).beginParse()
            );
            expect(res).toEqual(s.replaceAll(oldS, newS));
        }
    });

    it.skip('should work on long flag', async () => {
        for (let i = 0; i < 50; i++) {
            const s = makeid(Math.floor(Math.random() * 100) + 7000);
            let x = Math.floor(Math.random() * 2) + 125;
            let y = Math.floor(Math.random() * 5) + 1;
            const oldS = '1' + makeid(x);
            const newS = '1' + makeid(y);

            const res = loadBitstring(
                (
                    await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), storeBitstring(beginCell(), s))
                ).beginParse()
            );
            expect(res).toEqual(s.replaceAll(oldS, newS));
        }
    });

    it.skip('should work on long value', async () => {
        for (let i = 0; i < 50; i++) {
            const s = makeid(Math.floor(Math.random() * 100) + 7000);
            let x = Math.floor(Math.random() * 2) + 4;
            let y = Math.floor(Math.random() * 2) + 125;
            const oldS = '1' + makeid(x);
            const newS = '1' + makeid(y);

            const res = loadBitstring(
                (
                    await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), storeBitstring(beginCell(), s))
                ).beginParse()
            );
            expect(res).toEqual(s.replaceAll(oldS, newS));
        }
    });

    it.skip('should work on long flag and value', async () => {
        for (let i = 0; i < 50; i++) {
            const s = makeid(Math.floor(Math.random() * 100) + 7000);
            let x = Math.floor(Math.random() * 2) + 125;
            let y = Math.floor(Math.random() * 2) + 125;
            const oldS = '1' + makeid(x);
            const newS = '1' + makeid(y);

            const res = loadBitstring(
                (
                    await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), storeBitstring(beginCell(), s))
                ).beginParse()
            );
            expect(res).toEqual(s.replaceAll(oldS, newS));
        }
    });

    it('should work on long flag or value and actually replace something', async () => {
        const s =
            '0011111011111011010001100011110011100011010010111101101110110100000111101001101111011001010101010000011100011100001111011011110100110010001001000111001011000000110101011101110011010010101010011001000100101001101111000100110001111101011010001001110110111101011111010011000100001101101100010110011111111111011101110011100100011111011000111011100111010111110001011101000101111110010100110111010111001111100101110111100000111110000010110101110111010001110100011110011000101110101101100000100110011100110101101001100101010110010001010111101000100111100000110101101001010000111111011011010010110001010111110100100111101011000101000010101100000101000111111011001001000011011101011011001011101100101100101101000100110000000101111111011101101000101010011101111001111000001001111111000001111101001100001100110100101011111111010000001101010000011000000000000111111000000001101010011111111011010111100000001100110010001000001011010101110110010101001010100011000000111101001010100100000111001001011100100110111101111001001111010101000110100110110000001001110001000011010010100001011110010101010101000010010110100010011100010000100110001100010011010000101010000000011000111000011011011001010100011000001010001001000110101001010100110111100110000010000011010110001111000111111001001000011011001001111111010010000110101000110111110101110110101010101000010101011010111010101101100001100101011011111111101101010110111000101000110111100001111100000110110011000101010101001111111001100011100001110100111101111111011000101000100000100010100110000111000110000100010010010100010000001111101011011001101100011011011100001110011100001011000100100000111101110111101110000101101000000111001001101111001001101001011000010101010100111011011101111100111111101111111110110111011010010000011100000010001010000010101100111000011100001011111000110000111100110100010010100001000001100011111011101001000100010101000110111100111110100101010101010101001100001101000001100010000110101010111101100001111001101111011110001010110001101000100011001110010111010010010011111111000100110111011110001000110011111001011010111001101101101011101001111010000101011100111111110000111010111100001110101011110111101111111010001011011000001011000001011111011101010001001010111000101110000111100111101001000011100011011000111010001011011111111001010101010011100011010101000001001011101001100001110011011000101011101110110110001010111010100110111101011100010001010001101011100001111110111011111110010100100111100001001011111100111010101001011101000101110110110100001000100011011110110111110011101100001001110111111011111111100011101010101111111111101101000010100101110011011001001101000010011100111111000101111011000100100011001100111101011000010011001000010010111111111101010011110100100111000000011010110001100101001100100010001110011010010000111101110000110110001101110001100110010010000110001011001111001100001011111100000100010010111101010101101100011000001101100011100000110000111001100000011110101100100000110011001111100100011110110000111011110011010001010011000001000110100010000101110000111000010100010010011000001000000010100001001001100110000000010111101001000101001110010011011001010111101100100101011011001000100011011100000001100111110011100101010000000010001001110100100101010100000000101101001110001100100001101011000100111010110001100110010101110100001010100001011101101001110000111100101001011000010001011010110111100011010111001101010110000011010011110101110111110001100010010110100101000100001011111100101001111000010000100010101110111010101101011110011110000100000110010001101100100000100000011100100100011110011101100011100101100100000010010100001010000101101000110101010110100111111101111100000001011110010011001010010000011111100100000111111110011101101000000110110100100111010100111111011101001100000000010101011101100111011011111111000001110101001010111010101000001010001100111010100101100011110111001001101001110001000110010101010100000000010110100000011101001010111011100000010010111010011101011010001000000000110100010110000110';
        const oldS =
            '11101110110110001010111010100110111101011100010001010001101011100001111110111011111110010100100111100001001011111100111010101001';
        const newS =
            '1011100010001010001101011100001111110111111011101101100010101111111000010010111111001110101010011011110101001';
        const res = loadBitstring(
            (
                await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), storeBitstring(beginCell(), s))
            ).beginParse()
        );
        expect(res).toEqual(s.replaceAll(oldS, newS));
    });

    it('should work on 0-20 random strings', async () => {
        for (let i = 0; i < 200; i++) {
            const s = makeid(Math.floor(Math.random() * 21));
            let x = Math.floor(Math.random() * 25) + 1;
            let y = Math.floor(Math.random() * 25) + 1;
            const oldS = '1' + makeid(x);
            const newS = '1' + makeid(y);

            const res = loadBitstring(
                (
                    await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), storeBitstring(beginCell(), s))
                ).beginParse()
            );
            expect(res).toEqual(s.replaceAll(oldS, newS));
        }
    });

    it('should work on 255-1000 random strings', async () => {
        for (let i = 0; i < 50; i++) {
            const s = makeid(Math.floor(Math.random() * 745) + 255);
            let x = Math.floor(Math.random() * 5) + 1;
            let y = Math.floor(Math.random() * 5) + 1;
            const oldS = '1' + makeid(x);
            const newS = '1' + makeid(y);

            const res = loadBitstring(
                (
                    await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), storeBitstring(beginCell(), s))
                ).beginParse()
            );
            expect(res).toEqual(s.replaceAll(oldS, newS));
        }
    });

    it('should work on 1024-bit random strings', async () => {
        for (let i = 0; i < 50; i++) {
            const s = makeid(1023);
            let x = Math.floor(Math.random() * 4) + 1;
            let y = Math.floor(Math.random() * 4) + 1;
            const oldS = '1' + makeid(x);
            const newS = '1' + makeid(y);

            const res = loadBitstring(
                (
                    await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), storeBitstring(beginCell(), s))
                ).beginParse()
            );
            expect(res).toEqual(s.replaceAll(oldS, newS));
        }
    });

    it.skip('should work on 1024-8192 random strings', async () => {
        for (let i = 0; i < 50; i++) {
            const s = makeid(Math.floor(Math.random() * 7168) + 1024);
            let x = Math.floor(Math.random() * 4) + 1;
            let y = Math.floor(Math.random() * 4) + 1;
            const oldS = '1' + makeid(x);
            const newS = '1' + makeid(y);

            const res = loadBitstring(
                (
                    await task3.getReplace(BigInt('0b' + oldS), BigInt('0b' + newS), storeBitstring(beginCell(), s))
                ).beginParse()
            );
            expect(res).toEqual(s.replaceAll(oldS, newS));
        }
    });
});
