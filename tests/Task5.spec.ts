import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, Dictionary, beginCell, toNano } from 'ton-core';
import { Task5 } from '../wrappers/Task5';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task5', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task5'); // Cell.fromBoc(Buffer.from(require('../build/Task5.compiled.json').hex, 'hex'))[0]; //
    });

    let blockchain: Blockchain;
    let task5: SandboxContract<Task5>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        blockchain.verbosity = {
            vmLogs: 'none',
            blockchainLogs: false,
            debugLogs: true,
            print: true,
        };

        task5 = blockchain.openContract(Task5.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task5.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task5.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        expect(await task5.getResult(201, 4)).toEqual([
            '453973694165307953197296969697410619233826',
            '734544867157818093234908902110449296423351',
            '1188518561323126046432205871807859915657177',
            '1923063428480944139667114773918309212080528',
        ]);
        expect(await task5.getResult(1, 3)).toEqual(['1', '1', '2']);
        expect(await task5.getResult(2, 5)).toEqual(['1', '2', '3', '5', '8']);

        function getFib(n: number, k: number): string[] {
            const fibonacci = [0n, 1n];
            for (let i = 2; i <= n + k; i++) {
                fibonacci[i] = fibonacci[i - 1] + fibonacci[i - 2];
            }
            return fibonacci.slice(n, n + k).map(String);
        }

        console.log(await task5.getResult(1, 3));

        for (let n = 0; n <= 370; n++) {
            for (let k = 0; k <= 255; k++) {
                if (n + k > 371) break;
                console.log(n, k);
                expect(await task5.getResult(n, k)).toEqual(getFib(n, k));
            }
        }
    });
});
