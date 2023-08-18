import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, beginCell, toNano } from 'ton-core';
import { Task1 } from '../wrappers/Task1';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

function f(i: number, r: Cell[]): Cell {
    let b = beginCell().storeUint(i, 16);
    for (const c of r) {
        b.storeRef(c);
    }
    return b.endCell();
}

describe('Task1', () => {
    let code: Cell;
    let c0: Cell, c1: Cell, c3: Cell, c5: Cell, c9: Cell, c11: Cell;

    beforeAll(async () => {
        code = await compile('Task1');
        c3 = f(3, []);
        c9 = f(9, [f(10, [])]);
        c11 = f(11, []);
        c5 = f(5, [f(6, [f(7, [f(8, []), c9])])]);
        c1 = f(1, [f(2, [c3]), f(4, [])]);
        c0 = f(0, [c1, c5, c11]);
    });

    let blockchain: Blockchain;
    let task1: SandboxContract<Task1>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        blockchain.verbosity = {
            blockchainLogs: true,
            vmLogs: 'vm_logs_full',
            debugLogs: true,
            print: false,
        };

        task1 = blockchain.openContract(Task1.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task1.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task1.address,
            deploy: true,
        });
    });

    it('should find cells', async () => {
        console.log(c3.hash().toString('hex'));
        console.log(c9.hash().toString('hex'));
        expect(await task1.getResult(BigInt('0x' + c3.hash().toString('hex')), c0)).toEqualCell(c3);
        expect(await task1.getResult(BigInt('0x' + c9.hash().toString('hex')), c0)).toEqualCell(c9);
        expect(await task1.getResult(BigInt('0x' + c11.hash().toString('hex')), c0)).toEqualCell(c11);
        expect(await task1.getResult(BigInt('0x' + c5.hash().toString('hex')), c0)).toEqualCell(c5);
        expect(await task1.getResult(BigInt('0x' + c1.hash().toString('hex')), c0)).toEqualCell(c1);
        expect(await task1.getResult(BigInt('0x' + c0.hash().toString('hex')), c0)).toEqualCell(c0);
    });

    it('should not find cells', async () => {
        expect(await task1.getResult(123n, c0)).toEqualCell(Cell.EMPTY);
    });
});
