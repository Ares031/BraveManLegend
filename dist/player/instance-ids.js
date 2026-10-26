import { instancePrefixes } from '../content/items/id-rules.js';

// IndexedDB read/write transactions serialize allocation across pages and tabs.
// Only issue the ID after the transaction commits successfully.
export function createInstanceIds({database=globalThis.indexedDB,databaseName='bravemanlegend.player.instances.v1'}={}){
  let connection;
  function connect(){
    if(!connection)connection=new Promise((resolve,reject)=>{
      if(!database){reject(Error('無法儲存道具編號'));return;}
      const request=database.open(databaseName,1);
      request.onupgradeneeded=()=>request.result.createObjectStore('counters');
      request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();connection=null;};resolve(db);};
      request.onerror=()=>reject(request.error);
    });
    return connection;
  }
  async function next(kind){
    const prefix=instancePrefixes[kind];
    if(!prefix)throw Error('未知的道具實例類型');
    const db=await connect();
    return new Promise((resolve,reject)=>{
      const transaction=db.transaction('counters','readwrite'),store=transaction.objectStore('counters');
      const request=store.get(prefix);let result,error;
      request.onsuccess=()=>{
        const counter=request.result??0;
        if(!Number.isSafeInteger(counter)||counter<0||counter>99999999){error=Error('道具編號已用完或紀錄異常');transaction.abort();return;}
        result=`${prefix}-${String(counter).padStart(8,'0')}`;store.put(counter+1,prefix);
      };
      transaction.oncomplete=()=>resolve(result);
      transaction.onerror=()=>reject(error||transaction.error||Error('道具編號儲存失敗'));
      transaction.onabort=()=>reject(error||transaction.error||Error('道具編號儲存失敗'));
    });
  }
  return {next};
}
export const instanceIds=createInstanceIds();
