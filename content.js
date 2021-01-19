//$(document).ready(function(){
var timeout = 30000;
var plg_on_reassign_enable = false;
var url = '';
var json = '';
var reg_status = '';
var plg_list_regssendertypes = [];
var reassigned_tody = new Map();
var tody = new Date();

let str_today = tody.getFullYear() + '-' + ((tody.getMonth()+1)<10 ? '0' : '') + (tody.getMonth()+1) + '-' + tody.getDate();
tody = new Date(str_today);

var indexeddb = {
  server: 'regs-preregs-reassign',
  version: 1,
  schema: {
    reassigns: {
      key: { keyPath: 'id', autoIncrement: true },
      // Optionally add indexes
      indexes: {
        reassignReg: { },
        appealNumber: { },
        reassignDate: { }/*,
        kuvdCount: { },*/
        /*answer: { unique: true }*/
      }
    }
  }
};

  async function getLocalStorageValue(name){
    return new Promise(resolve => {
      chrome.storage.local.get(name, data=> {
        resolve(data);
      });
    });
  }

  /*async function connect(db){
    //db.open(indexeddb, function () {
      console.log("indexedDB open");
    //});  
  }  
  async function query(db, filter){
     
      db.table("reassigns").query("appealNumber").filter(filter).execute(return new Promise(resolve => function(r){
        console.log("result filter",r);
        resolve (r);      
      }));
    
  }
  
  async function getCount(reassignDate, reassignReg){
      let db = new exDB();
      await connect(db);
      let reasign_end_date = new Date(reassignDate); 
      reasign_end_date = new Date(reasign_end_date.setDate(reasign_end_date.getDate() + 1));
      //let filter = "return item.reassignReg=='"+value+"' && return item.reassignDate>="+ reasign_date.getTime() +" && item.reassignDate<"+ reasign_end_date.getTime() +" ";
      let filter = "return item.reassignReg=='"+reassignReg+"' && item.reassignDate>="+ reassignDate.getTime() +" && item.reassignDate<"+ reasign_end_date.getTime();
      console.log("filter",filter);
      let res = await query(db, filter);
      return res;  
  } */
function getCount(reassignDate, reassignReg){
  var db = new exDB();
  db.open(indexeddb, function () {
    let reasign_end_date = new Date(reassignDate); 
    reasign_end_date = new Date(reasign_end_date.setDate(reasign_end_date.getDate() + 1));
    //let filter = "return item.reassignReg=='"+value+"' && return item.reassignDate>="+ reasign_date.getTime() +" && item.reassignDate<"+ reasign_end_date.getTime() +" ";
    let filter = "return item.reassignReg=='"+reassignReg+"' && item.reassignDate>="+ reassignDate.getTime() +" && item.reassignDate<"+ reasign_end_date.getTime();
    //console.log("filter",filter);
        
    db.table("reassigns").query("appealNumber").filter(filter).execute(function(r){
      //console.log("result filter",r);          
      if (r != null && r.length > 0){
        //reg = r.length;
        //reassigned_tody[reassignReg] = r.length;
        reassigned_tody.set(reassignReg, r.length);
      } else {
        //reg = 0;
        //reassigned_tody[reassignReg] = 0;
        reassigned_tody.set(reassignReg, 0);
      }
    });
  });
}

    
(async() => {
var server;
  
  let indexeddb_json = await getLocalStorageValue('plg_regs_preregs_reassign_indexeddb');
  indexeddb = JSON.parse(Object.values(indexeddb_json)[0]);
  
  timeout = await getLocalStorageValue('plg_timeout');
  timeout = ((typeof(timeout) != "undefined" && Object.values(timeout) != null && Object.values(timeout)[0] != "") ? parseInt(Object.values(timeout)[0]) : 60000);
  
  plg_on_reassign_enable = await getLocalStorageValue('plg_on_reassign_enable');
  plg_on_reassign_enable = Object.values(plg_on_reassign_enable)[0];
  
  url = await getLocalStorageValue('plg_def_url');
  url = Object.values(url)[0];
  
  json = await getLocalStorageValue('plg_def_json');
  json = Object.values(json)[0];
  
  reg_status = await getLocalStorageValue('plg_def_status');
  reg_status = ((typeof(reg_status) != "undefined" && Object.values(reg_status) != null && Object.values(reg_status)[0] != "") ? Object.values(reg_status)[0] : "initial_examinations");  
  //console.log(reg_status);
  
  plg_regs_preregs_reassign_type = await getLocalStorageValue('plg_regs_preregs_reassign_type');
  plg_regs_preregs_reassign_type = Object.values(plg_regs_preregs_reassign_type)[0];
  
  plg_list_regssendertypes = await getLocalStorageValue('plg_list_regssendertypes');
  plg_list_regssendertypes = JSON.parse(Object.values(plg_list_regssendertypes)[0]);
  console.log(plg_list_regssendertypes);

  if(reassigned_tody.size <= 0){
    $.each(plg_list_regssendertypes, function(index,value){
      $.each(value.regs.split(','), function(index,value){
        //reassigned_tody[value] = 0;
        reassigned_tody.set(value, 0);
        //reassigned_tody.length += 1;
        let reasign_date = new Date(tody);
        getCount(reasign_date, value);
      });
    });              
  }
  
  /*console.log(reassigned_tody);
  $.each(reassigned_tody, function(index,value){
    console.log(reassigned_tody[index]);
    let reasign_date = new Date(tody);
    getCount(reasign_date, index, reassigned_tody[index]);
  });*/

  
  /*let date_today = new Date();            
  let str_date_today = date_today.getFullYear() + '-' + ((date_today.getMonth()+1)<10 ? '0' : '') + (date_today.getMonth()+1) + '-' + date_today.getDate();
                  
  let reasign_date = new Date(str_date_today);

  let reassigned_tody = 0; 
  reassigned_tody = await getCount(reasign_date,'naushakova');
  console.log("naushakova: ",reassigned_tody);*/
 
  setInterval(function (){
    function postAjaxData(url, json){
      var result = "";
      $.ajax({
        url: url,
        dataType: "json",
        data: JSON.stringify(json),
        method: "POST",
        contentType: "application/json;charset=UTF-8",
        async: false,
        success: function(data) {
          //console.log(data);
          result = data;
        } 
      });
      return result
    }
    
    function getAjaxData(url){
      var result = "";
      $.ajax({
        url: url,
        dataType: "json",
        method: "GET",
        contentType: "application/json;charset=UTF-8",
        async: false,
        success: function(data) {
          result = data;
        } 
      });
      return result
    } 
        
    if(document.webkitVisibilityState == 'visible'){      
      //let plg_on_reassign_enable = await getLocalStorageValue('plg_on_reassign_enable');
      if(plg_on_reassign_enable == true){
        /**
         *Получаем распределяемые обращения.
         **/
        $.ajax({
          url: url,
          dataType: "json",
          data: json/*JSON.stringify(json)*/,
          method: "POST",
          contentType: "application/json;charset=UTF-8",
          async: true,
          success: function(data) {
            /**
             *Результат выполнения POST запроса
             **/
            console.log(data);
            /**
             *Массив регов для типа источника поступлений обращений с количеством "заявлений(обр.)" разбитый по дате исполнения по регламенту.  
             **/
            if (data.requests.length > 0){
              
              let date_today = new Date();            
              let str_date_today = date_today.getFullYear() + '-' + ((date_today.getMonth()+1)<10 ? '0' : '') + (date_today.getMonth()+1) + '-' + date_today.getDate();
                  
              let reasign_date = new Date(str_date_today);
                  
              if (tody.getTime() != reasign_date.getTime()){
                reassigned_tody = new Map();
                tody = reasign_date;
              }                   

              if(reassigned_tody.size <= 0){
                $.each(plg_list_regssendertypes, function(index,value){
                  $.each(value.regs.split(','), function(index,value){
                    //reassigned_tody[value] = 0;
                    reassigned_tody.set(value, 0);
                    //reassigned_tody.length += 1;
                  });
                  /*if(reassigned_tody.lenght = 0){
                    reassigned_tody.splice(index, 0, reg);
                    $.merge(reassigned_tody,value.regs.split(','));
                  } else {
                    reassigned_tody.push(value.regs.split(','));
                  }*/
                });              
              }

              let reg_list = [];
              $.each(plg_list_regssendertypes, function(index,value){
                
                /**
                 *подсчет количества по дням
                **/
                
                let regs = []; 
                
                let reg_list_item = value.regs.split(',');
                $.each(reg_list_item, function(reg_index,reg_item){
                  //console.log(reg_item);
                  //            {"pageNumber":0,"pageSize":10,"statuses":["reg_validations"],"executionDate":{"dateFrom":"2020-12-31","dateTo":"2020-12-31"},"subjectRF":["12"],"executorDepartments":["12.053"],"executors":["asianeev"],"byActiveExecutor":true}
                  let regjson = {pageNumber:0,pageSize:1000,statuses:[reg_status],executors:[reg_item],byActiveExecutor:true};
                  let req = postAjaxData('http://ppoz-service-bal-01.prod.egrn:9001/manager/requests',regjson);
                  //console.log(req);
                  
                  let count_date = [];
                  $.each(req.requests, function(request_index,request_item){
                    let date = request_item.executionDate.substr(0,10);
                    count_date[date] = (typeof(count_date[date]) == "undefined" ? 1 : count_date[date] + 1);                  
                  });
                  
                  let reg = {login: reg_item, count: req.requests.length, tody: reasign_date, /*reassigned_tody: reassigned_tody[reg_item],*/ count_date: count_date};
                  
                  /**
                   *поиск и вставка рега по возрастанию исходя из колличества обращений
                  **/
                  let insertindex = -1;      
                  if(regs.length>0){                    
                    $.each(regs, function(index,item){
                      if(item.count >= reg.count){
                        regs.splice(index, 0, reg);
                        insertindex = index; 
                        return false;
                      }  
                    });                    
                  }
                  if(insertindex < 0){
                    regs.push(reg);
                  }                                                                                          
                });

                /**
                 *вставка скиска регов по источнику поступлений
                **/
                reg_list.push({types:value.sendertypes, regs: regs});
                                                                
              }); 
              //console.log(reg_list);
              //plg_list_regssendertypes[0].sendertypes
              
              //console.log(reg_list);
              $.each(data.requests, function(index,req_item){
                let date = req_item.executionDate.substr(0,10);
   
                /**
                 *получаем обращение
                **/
                url_byId = "http://ppoz-service-bal-01.prod.egrn:9001/manager/requests/byId?id=".concat(req_item.appealNumber);
                let reqbyid = getAjaxData(url_byId);                
                console.log(reqbyid);
                
                /**
                 *подбираем рега для назначения
                **/
                $.each(reg_list, function(index,reg_list_item){
                  /*let types_match = reg_list_item.types.match(/"'"+reqbyid.senderName+"'"/g);
                  console.log(types_match);*/
                  /**
                   *Выбор списка регов по источнику поступления или другому признаку деления пользователей.                  
                  **/
                  if(reg_list_item.types.indexOf("'"+reqbyid.senderName+"'")>=0){
                    console.log(reg_list_item);

                    /**
                     *поиск рега с наименьшим количеством на дату исполнения по регламенту распределяемого обращения
                    **/
                    let reg_index_min_count = -1;
                    let reg_date_min_count = 9999;
                    
                    if (plg_regs_preregs_reassign_type == "result"){                     
                      $.each(reg_list_item.regs, function(reg_index,reg_item){
                        reg_item.count_date[date] = (typeof(reg_item.count_date[date]) == "undefined" ? 0 : reg_item.count_date[date]);
                        if (reg_item.count_date[date] < reg_date_min_count){
                          reg_date_min_count = reg_item.count_date[date];
                          reg_index_min_count = reg_index;  
                        }                      
                      });
                    } else {                                    

                      let reassigned_tody_min_count = 9999;
                      /*$.each(reassigned_tody, function(index,value){
                        if (value < reassigned_tody_min_count){
                          reassigned_tody_min_count = value;
                        }
                      });*/
                      let tmp_regs = [];
                      for(let value of reg_list_item.regs){
                        tmp_regs.push(value.login);                        
                      }
                      
                      for(let key of reassigned_tody.keys()){                        
                        if (reassigned_tody.get(key) < reassigned_tody_min_count && $.inArray(key, tmp_regs) >= 0){                        
                          reassigned_tody_min_count = reassigned_tody.get(key);
                        }
                      }                      

                      let reg_date_min_count = 9999;
                                            
                      $.each(reg_list_item.regs, function(reg_index,reg_item){                        
                        reg_item.count_date[date] = (typeof(reg_item.count_date[date]) == "undefined" ? 0 : reg_item.count_date[date]);
                        if (reg_item.count_date[date] < reg_date_min_count && reassigned_tody_min_count == reassigned_tody.get(reg_item.login)/*reassigned_tody[reg_item.login]*/){
                          reg_date_min_count = reg_item.count_date[date];
                          reg_index_min_count = reg_index;  
                        }                      
                      });

                      //let reglogin = reg_list_item.regs[reg_index_min_count].login;

                    }
                    /**
                     *назначение обращения на подобранного рега
                    **/
                    if (reg_index_min_count >= 0){
                      reg_list_item.regs[reg_index_min_count].count_date[date] = reg_list_item.regs[reg_index_min_count].count_date[date] + 1;
                      console.log(reg_list_item.regs[reg_index_min_count]);                      
                      //{"requestNumbers":["PKPVDMFC-2020-12-30-367882"],"role":"PKURP_PREREG","user":"osradzhabova"}
                      let role = (reg_status == "find_object_to_extractions" ? "PKURP_INFO" : (reg_status == "reg_validations" ? "PKURP_REG" : "PKURP_PREREG"));
                      let reassignjson = {requestNumbers:[req_item.appealNumber],role:role,user:reg_list_item.regs[reg_index_min_count].login};
                      console.log(reassignjson);
                      let reassignreq = postAjaxData('http://ppoz-service-bal-01.prod.egrn:9001/manager/assign/reassign',reassignjson);
                      console.log(reassignreq);
                      
                      //reassigned_tody[reg_list_item.regs[reg_index_min_count].login] = reassigned_tody[reg_list_item.regs[reg_index_min_count].login] + 1;
                      reassigned_tody.set(reg_list_item.regs[reg_index_min_count].login, reassigned_tody.get(reg_list_item.regs[reg_index_min_count].login) + 1);
                      
                      let count_kuvd = [];
                      /*$.each(reqbyid, function(index,item){                                            
                        if(count_kuvd.length>0){
                          if ($.inArray(item.idKUVDRecord, count_kuvd) < 0){
                            count_kuvd.push(item.idKUVDRecord);
                          }
                        } else {
                          count_kuvd.push(item.idKUVDRecord);
                        }                        
                      });*/
                      for(var j=0; j<reqbyid.statements.length; j++){
                        if(count_kuvd.length>0){
                          if ($.inArray(reqbyid.statements[j].idKUVDRecord, count_kuvd) < 0){
                            count_kuvd.push(reqbyid.statements[j].idKUVDRecord);
                          }
                        } else {
                          count_kuvd.push(reqbyid.statements[j].idKUVDRecord);
                        }
                      }
                      console.log("KUVD: ",count_kuvd);
                      
                      /**
                       *Запись о назначение в IndexedDB
                      **/
                      /*chrome.runtime.sendMessage({"cmd": "open", "params": indexeddb}, function (result) {
                        if (result && result.RUNTIME_ERROR) {
                          console.error(result.RUNTIME_ERROR.message);
                          result = null;
                        }
                      });*/
                      /*chrome.runtime.sendMessage({
                          reassignReg: reg_list_item.regs[reg_index_min_count].login,
                          appealNumber: req_item.appealNumber,
                          reassignDate: new Date(),
                          kuvdCount: count_kuvd.length
                        }, function (result) {
                        if (result && result.RUNTIME_ERROR) {
                          console.error(result.RUNTIME_ERROR.message);
                          result = null;
                        }
                      });*/
                      
                      var db = new exDB();
                      db.open(indexeddb, function () {
                        db.table("reassigns").add({
                          reassignReg: reg_list_item.regs[reg_index_min_count].login,
                          appealNumber: req_item.appealNumber,
                          reassignDate: (new Date().getTime()), //время в милисекундах (1сек - 1000 мсек) от 1 января 1970 г. 00:00:00 по UTC
                          kuvdCount: count_kuvd.length
                        },function(r){
                          console.log(r);
                          db.close(function(){
                            console.log("closed");
                          }); 
                        });
                      });                      
                    }                     
                    //break();                   
                  } 
                });
                              
              });
            }
            //result = data;
            //$(selctor).html(data.requests.length);
          } 
        });
      }    
    }
  }, timeout);
})();    
//});