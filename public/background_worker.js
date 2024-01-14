var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { proxy } from 'comlink';
import { initIpfsNode } from '../../../ipfs/node/factory';
import QueueManager from '../../../QueueManager/QueueManager';
import { QueuePriority, } from '../../../QueueManager/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { exposeWorkerApi } from '../factoryMethods';
import { SyncService } from '../../services/sync/sync';
import BroadcastChannelSender from '../../channels/BroadcastChannelSender';
import DeferredDbSaver from '../../services/DeferredDbSaver/DeferredDbSaver';
const createBackgroundWorkerApi = () => {
    const dbInstance$ = new Subject();
    const ipfsInstance$ = new BehaviorSubject(undefined);
    const params$ = new BehaviorSubject({
        myAddress: null,
        followings: [],
    });
    let ipfsNode;
    const defferedDbSaver = new DeferredDbSaver(dbInstance$);
    const ipfsQueue = new QueueManager(ipfsInstance$, {
        defferedDbSaver,
    });
    const broadcastApi = new BroadcastChannelSender();
    const syncService = new SyncService({
        waitForParticleResolve: (cid, priority = QueuePriority.MEDIUM) => __awaiter(void 0, void 0, void 0, function* () { return ipfsQueue.enqueueAndWait(cid, { postProcessing: true, priority }); }),
        dbInstance$,
        ipfsInstance$,
        params$,
    });
    const init = (dbApiProxy) => __awaiter(void 0, void 0, void 0, function* () {
        dbInstance$.next(dbApiProxy);
    });
    const stopIpfs = () => __awaiter(void 0, void 0, void 0, function* () {
        if (ipfsNode) {
            yield ipfsNode.stop();
        }
        ipfsInstance$.next(undefined);
        broadcastApi.postServiceStatus('ipfs', 'inactive');
    });
    const startIpfs = (ipfsOpts) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (ipfsNode) {
                console.log('Ipfs node already started!');
                yield ipfsNode.stop();
            }
            broadcastApi.postServiceStatus('ipfs', 'starting');
            ipfsNode = yield initIpfsNode(ipfsOpts);
            ipfsInstance$.next(ipfsNode);
            setTimeout(() => broadcastApi.postServiceStatus('ipfs', 'started'), 0);
            return true;
        }
        catch (err) {
            console.log('----ipfs node init error ', err);
            const msg = err instanceof Error ? err.message : err;
            broadcastApi.postServiceStatus('ipfs', 'error', msg);
            throw Error(msg);
        }
    });
    const defferedDbApi = {
        importCyberlinks: (links) => {
            defferedDbSaver.enqueueLinks(links);
        },
    };
    const ipfsApi = {
        start: startIpfs,
        stop: stopIpfs,
        getIpfsNode: () => __awaiter(void 0, void 0, void 0, function* () { return ipfsNode && proxy(ipfsNode); }),
        config: () => __awaiter(void 0, void 0, void 0, function* () { return ipfsNode === null || ipfsNode === void 0 ? void 0 : ipfsNode.config; }),
        info: () => __awaiter(void 0, void 0, void 0, function* () { return ipfsNode === null || ipfsNode === void 0 ? void 0 : ipfsNode.info(); }),
        fetchWithDetails: (cid, parseAs) => __awaiter(void 0, void 0, void 0, function* () { return ipfsNode === null || ipfsNode === void 0 ? void 0 : ipfsNode.fetchWithDetails(cid, parseAs); }),
        enqueue: (cid, callback, options) => __awaiter(void 0, void 0, void 0, function* () { return ipfsQueue.enqueue(cid, callback, options); }),
        enqueueAndWait: (cid, options) => __awaiter(void 0, void 0, void 0, function* () { return ipfsQueue.enqueueAndWait(cid, options); }),
        dequeue: (cid) => __awaiter(void 0, void 0, void 0, function* () { return ipfsQueue.cancel(cid); }),
        dequeueByParent: (parent) => __awaiter(void 0, void 0, void 0, function* () { return ipfsQueue.cancelByParent(parent); }),
        clearQueue: () => __awaiter(void 0, void 0, void 0, function* () { return ipfsQueue.clear(); }),
        addContent: (content) => __awaiter(void 0, void 0, void 0, function* () { return ipfsNode === null || ipfsNode === void 0 ? void 0 : ipfsNode.addContent(content); }),
    };
    return {
        init,
        isInitialized: () => !!ipfsInstance$.value,
        ipfsApi: proxy(ipfsApi),
        defferedDbApi: proxy(defferedDbApi),
        ipfsQueue: proxy(ipfsQueue),
        setParams: (params) => params$.next(Object.assign(Object.assign({}, params$.value), params)),
    };
};
const backgroundWorker = createBackgroundWorkerApi();
exposeWorkerApi(self, backgroundWorker);
//# sourceMappingURL=worker.js.map