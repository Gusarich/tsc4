import { Blockchain, GetMethodResult, SandboxContract } from '@ton-community/sandbox';
import { Cell, beginCell, toNano } from 'ton-core';
import { Task4 } from '../wrappers/Task4';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { GetMethodResultError } from '@ton-community/sandbox/dist/executor/Executor';

describe('Task4', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task4');
    });

    let blockchain: Blockchain;
    let task4: SandboxContract<Task4>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        blockchain.verbosity = {
            blockchainLogs: false,
            vmLogs: 'none',
            debugLogs: true,
            print: true,
        };

        task4 = blockchain.openContract(Task4.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task4.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task4.address,
            deploy: true,
            success: true,
        });
    });

    it('should work', async () => {
        expect(
            await task4.getEncryptCell(2, beginCell().storeUint(0, 32).storeUint(102, 8).storeUint(130, 8).endCell())
        ).toEqualCell(beginCell().storeUint(0, 32).storeUint(104, 8).storeUint(130, 8).endCell());

        expect(await task4.getEncrypt(2, 'HelloWorld')).toEqualCell(
            beginCell().storeUint(0, 32).storeStringTail('JgnnqYqtnf').endCell()
        );

        expect(
            await task4.getEncrypt(
                10,
                'Somet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ss'
            )
        ).toEqualCell(
            beginCell()
                .storeUint(0, 32)
                .storeStringTail(
                    'Cywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc cc'
                )
                .endCell()
        );
    });

    it('should deploy', async () => {
        try {
            await task4.getEncrypt(
                10,
                'Somet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ss'
            );
        } catch (e) {
            console.log(e);
        }

        expect(await task4.getEncrypt(2, 'HelloWorld')).toEqualCell(
            beginCell().storeUint(0, 32).storeStringTail('JgnnqYqtnf').endCell()
        );

        expect(await task4.getDecrypt(2, 'JgnnqYqtnf')).toEqualCell(
            beginCell().storeUint(0, 32).storeStringTail('HelloWorld').endCell()
        );

        console.log(
            (
                await task4.getEncrypt(
                    10,
                    'Somet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ss'
                )
            )
                .beginParse()
                .loadStringTail()
        );
        console.log(
            (
                await task4.getEncrypt(
                    10,
                    'Somet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ss'
                )
            )
                .beginParse()
                .loadStringTail()
        );

        expect(
            await task4.getEncrypt(
                10,
                'Somet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ss'
            )
        ).toEqualCell(
            beginCell()
                .storeUint(0, 32)
                .storeStringTail(
                    'Cywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc cc'
                )
                .endCell()
        );

        console.log(123);

        console.log(
            beginCell()
                .storeUint(0, 32)
                .storeStringTail(
                    'Cywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc cc'
                )
                .endCell()
                .toBoc()
                .toString('base64')
        );

        expect(
            await task4.getEncrypt(
                10,
                'Somet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ss'
            )
        ).toEqualCell(
            beginCell()
                .storeUint(0, 32)
                .storeStringTail(
                    'Cywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc ccCywod cdbsxq cp cnpncp ncpcn pncpnc cc'
                )
                .endCell()
        );
        try {
            await task4.getEncrypt(
                10,
                'Somet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ssSomet string sf sdfdsf dsfsd fdsfds ss'
            );
        } catch (e) {
            console.log((e as GetMethodResult).vmLogs);
        }
    });
});
