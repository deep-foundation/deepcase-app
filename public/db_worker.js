var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import cozoDb from '../../../CozoDb/cozoDb';
import { exposeWorkerApi } from '../factoryMethods';
import BroadcastChannelSender from '../../channels/BroadcastChannelSender';
const createDbWorkerApi = () => {
    let isInitialized = false;
    const channel = new BroadcastChannelSender();
    const postServiceStatus = (status) => channel.postServiceStatus('db', status);
    const init = () => __awaiter(void 0, void 0, void 0, function* () {
        postServiceStatus('starting');
        if (isInitialized) {
            console.log('Db: already initialized!');
            postServiceStatus('started');
            return;
        }
        const onWriteCallback = (writesCount) => channel.post({ type: 'indexeddb_write', value: writesCount });
        yield cozoDb.init(onWriteCallback);
        isInitialized = true;
        setTimeout(() => {
            postServiceStatus('started');
        }, 0);
    });
    const runCommand = (command) => __awaiter(void 0, void 0, void 0, function* () { return cozoDb.runCommand(command); });
    const executePutCommand = (tableName, array) => __awaiter(void 0, void 0, void 0, function* () { return cozoDb.put(tableName, array); });
    const executeRmCommand = (tableName, keyValues) => __awaiter(void 0, void 0, void 0, function* () { return cozoDb.rm(tableName, keyValues); });
    const executeUpdateCommand = (tableName, array) => __awaiter(void 0, void 0, void 0, function* () { return cozoDb.update(tableName, array); });
    const executeGetCommand = (tableName, selectFields, conditions, conditionFields, options = {}) => __awaiter(void 0, void 0, void 0, function* () { return cozoDb.get(tableName, conditions, selectFields, conditionFields, options); });
    const importRelations = (content) => __awaiter(void 0, void 0, void 0, function* () { return cozoDb.importRelations(content); });
    const exportRelations = (relations) => __awaiter(void 0, void 0, void 0, function* () { return cozoDb.exportRelations(relations); });
    const executeBatchPutCommand = (tableName, array, batchSize = array.length, onProgress) => __awaiter(void 0, void 0, void 0, function* () {
        const { getCommandFactory, runCommand } = cozoDb;
        const commandFactory = getCommandFactory();
        const putCommand = commandFactory.generateModifyCommand(tableName, 'put');
        let isOk = true;
        for (let i = 0; i < array.length; i += batchSize) {
            const batch = array.slice(i, i + batchSize);
            const atomCommand = commandFactory.generateAtomCommand(tableName, batch);
            const result = yield runCommand([atomCommand, putCommand].join('\r\n'));
            if (!result.ok) {
                isOk = false;
            }
            onProgress && onProgress(i + batch.length);
        }
        return { ok: isOk };
    });
    return {
        isInitialized: () => __awaiter(void 0, void 0, void 0, function* () { return isInitialized; }),
        init,
        runCommand,
        executeRmCommand,
        executePutCommand,
        executeBatchPutCommand,
        executeUpdateCommand,
        executeGetCommand,
        importRelations,
        exportRelations,
    };
};
const cozoDbWorker = createDbWorkerApi();
exposeWorkerApi(self, cozoDbWorker);
//# sourceMappingURL=worker.js.map