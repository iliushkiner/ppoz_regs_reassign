//$(document).ready(function(){
var timeout = 60000;
var plg_regs_reassign_reassign_enable = false;
var plg_regs_reassign_debug_off_enable = false;
var url = 'http://ppoz-service-bal-01.prod.egrn:9001/manager/requests';
var json = '';
var json_list = [];
var reg_status = "initial_examinations";
var plg_regs_reassign_type = "result";
var plg_regs_reassign_filter_list = [];
var reassigned_today = new Map();
var plg_regs_reassign_appealnumber_list ='';
var today = new Date();

let str_today = today.getFullYear() + '-' + ((today.getMonth()+1)<10 ? '0' : '') + (today.getMonth()+1) + '-' + today.getDate();
today = new Date(str_today);

var indexeddb = {
  server: 'pkurp-reg-reassign',
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

/**
 * Проверяет фильтр и возвращает true если условия подходят
 */
function check_filter(index, value, reqbyiditem, like){
    let result = true;
    if (index != 'array' && index != 'like'){
        /**
         * Проверка на массив. В некоторых случаях value определяется как объект вместо Array
         */
        let is_array = false;
        $.each(value, function(vindex,vvalue){
            is_array = (vindex === 0);
            return false;
        });
        
        if(/*Array.isArray(value)*/is_array){
            if(!like){
                $.each(value, function(vindex,vvalue){
                    value[vindex] = vvalue.replace(/\s+/g,"");
                });
                result = (value.indexOf(reqbyiditem[index].replace(/\s+/g,""))>=0); 
            } else {
                for(let likeval of value){
                    /**
                     * Ищем вхождение подстроки likeval в reqbyiditem[index]
                     */
                    if(reqbyiditem[index] != ""){
                        let patern = new RegExp(likeval,'g');
                        let match = reqbyiditem[index].match(patern);
                        result = (typeof(match) != "undefined" &&  match != null && match.length>0);
                        if (result) break;
                    } else {
                        result = false;
                        break;
                    }
                    
                }
            }
        } else if(typeof(value) === 'object'){
            $.each(value, function(vindex,vvalue){
               result = check_filter(vindex, vvalue, reqbyiditem[vindex], false); 
               return result;
            });
        }
    }else if(index == 'like'){
        console.log("UPS LIKE!");
        $.each(value, function(vindex,vvalue){
            result = (result && check_filter(vindex, vvalue, reqbyiditem, true)); 
            return !result;
            /*if (!result) {
                break;
            }*/
        });
    } else {
        //for(let filter of value.array){
        $.each(value, function(vindex,vvalue){
            if (reqbyiditem[vindex].length > 0){
              for(let reqbyid_arrayitem of reqbyiditem[vindex]){
                result = true;
                $.each(vvalue, function(vvindex,vvvalue){
                    result = (result && check_filter(vvindex, vvalue[vvindex], reqbyid_arrayitem, false)); 
                    return result;
                });
                if (result) {
                    break;
                }
              }
            } else {
              result = false; 
              return result;
            }
        });
    }
    return result;
}

function check_JSON_Filter(json_filter, reqbyid){
    //console.log("json_filter",json_filter);
    //console.log("reqbyid",reqbyid);
    let filterstatus = true;
    for(let filter of json_filter){
        filterstatus = true;
        $.each(filter, function(index,value){
           filterstatus = (filterstatus && check_filter(index, value, reqbyid, false));//(value.indexOf(reqbyid[index])>=0); 
           /**
            * выход если параметр фильтра не соответствует обращению.
            * выход из $.each return false;
            */
           return filterstatus;
        });        
        if (filterstatus) {
            break;
        }
    }
    return filterstatus;
}

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
    //console.log("filter:",filter);
        
    db.table("reassigns").query("appealNumber").filter(filter).execute(function(r){
      //console.log("result:",r);          
      if (r != null && r.length > 0){
        //reg = r.length;
        //reassigned_today[reassignReg] = r.length;
        reassigned_today.set(reassignReg, {"count": r.length, "percent": reassigned_today.get(reassignReg).percent, "limit": reassigned_today.get(reassignReg).limit});
      } else {
        //reg = 0;
        //reassigned_today[reassignReg] = 0;
        reassigned_today.set(reassignReg, {"count": 0, "percent": reassigned_today.get(reassignReg).percent, "limit": reassigned_today.get(reassignReg).limit});
      }
    });
  });
}

    
(async() => {
var server;
  
  let indexeddb_json = await getLocalStorageValue('plg_regs_reassign_indexeddb');
  indexeddb = typeof(Object.values(indexeddb_json)[0]) != "undefined" ? JSON.parse(Object.values(indexeddb_json)[0]) : indexeddb;
  console.log("indexeddb:",indexeddb);
  
  let tmptimeout = await getLocalStorageValue('plg_regs_reassign_timeout');
  timeout = (Object.values(tmptimeout).length>0 ? parseInt(Object.values(tmptimeout)[0]) : timeout);
  console.log("timeout:",timeout);
  
  let tmpplg_regs_reassign_reassign_enable = await getLocalStorageValue('plg_regs_reassign_reassign_enable');
  tmpplg_regs_reassign_reassign_enable = Object.values(tmpplg_regs_reassign_reassign_enable);
  plg_regs_reassign_reassign_enable = (typeof(tmpplg_regs_reassign_reassign_enable[0]) != "undefined" ? tmpplg_regs_reassign_reassign_enable[0] : plg_regs_reassign_reassign_enable);
  console.log("plg_regs_reassign_reassign_enable:",plg_regs_reassign_reassign_enable);
  
  let tmpplg_regs_reassign_debug_off_enable = await getLocalStorageValue('plg_regs_reassign_debug_off_enable');
  tmpplg_regs_reassign_debug_off_enable = Object.values(tmpplg_regs_reassign_debug_off_enable);
  plg_regs_reassign_debug_off_enable = (typeof(tmpplg_regs_reassign_debug_off_enable[0]) != "undefined" ? tmpplg_regs_reassign_debug_off_enable[0] : plg_regs_reassign_debug_off_enable);
  console.log("plg_regs_reassign_debug_off_enable:",plg_regs_reassign_debug_off_enable);
  
  let tmpurl = await getLocalStorageValue('plg_regs_reassign_req_url');
  url = typeof(Object.values(tmpurl)[0]) != "undefined" ? Object.values(tmpurl)[0] : url;
  console.log("url:",url);
  
  json_list = await getLocalStorageValue('plg_regs_reassign_req_json_list');
  json_list = typeof(Object.values(json_list)[0]) != "undefined" ? JSON.parse(Object.values(json_list)[0]) : [];
  console.log("json_list:",json_list);
  
  /*json = await getLocalStorageValue('plg_regs_reassign_req_json');
  json = Object.values(json)[0];
  console.log("json:",json);*/
  
  let tmpreg_status = await getLocalStorageValue('plg_regs_reassign_status');
  reg_status = ((typeof(Object.values(tmpreg_status)[0]) != "undefined") ? Object.values(tmpreg_status)[0] : reg_status);  
  //console.log(reg_status);
  console.log("reg_status:",reg_status);
  
  let tmpplg_regs_reassign_type = await getLocalStorageValue('plg_regs_reassign_type');
  plg_regs_reassign_type = (typeof(Object.values(tmpplg_regs_reassign_type)[0]) != "undefined")  ? Object.values(tmpplg_regs_reassign_type)[0] : plg_regs_reassign_type;
  console.log("plg_regs_reassign_type:",plg_regs_reassign_type);
  
  plg_regs_reassign_filter_list = await getLocalStorageValue('plg_regs_reassign_filter_list');
  plg_regs_reassign_filter_list = (Object.values(plg_regs_reassign_filter_list).length>0) ? JSON.parse(Object.values(plg_regs_reassign_filter_list)[0]) : [];
  console.log("plg_regs_reassign_filter_list:",plg_regs_reassign_filter_list);
  
  plg_regs_reassign_appealnumber_list = await getLocalStorageValue('plg_regs_reassign_appealnumber_list');
  plg_regs_reassign_appealnumber_list = (Object.values(plg_regs_reassign_appealnumber_list).length>0) ? JSON.parse(Object.values(plg_regs_reassign_appealnumber_list)[0]) : [];    
  console.log("plg_regs_reassign_appealnumber_list:",plg_regs_reassign_appealnumber_list);

  if(reassigned_today.size <= 0){
    $.each(plg_regs_reassign_filter_list, function(index,value){
      $.each(value.regs, function(index,value){
        //reassigned_today[value] = 0;
        reassigned_today.set(value.login, {"count": 0, "percent": value.percent, "limit": typeof(value.limit) != "undefined" ? value.limit : 0});
        //reassigned_today.length += 1;
        let reasign_date = new Date(today);
        getCount(reasign_date, value.login);
      });
    });              
  }
  
  /*console.log(reassigned_today);
  $.each(reassigned_today, function(index,value){
    console.log(reassigned_today[index]);
    let reasign_date = new Date(today);
    getCount(reasign_date, index, reassigned_today[index]);
  });*/

  
  /*let date_today = new Date();            
  let str_date_today = date_today.getFullYear() + '-' + ((date_today.getMonth()+1)<10 ? '0' : '') + (date_today.getMonth()+1) + '-' + date_today.getDate();
                  
  let reasign_date = new Date(str_date_today);

  let reassigned_today = 0; 
  reassigned_today = await getCount(reasign_date,'naushakova');
  console.log("naushakova: ",reassigned_today);*/
    
  setInterval(function (){
    /**
     * Не ассинхронный AJAX POST запрос
     */
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
    
    /**
     * Не ассинхронный AJAX GET запрос
     */
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
    
    /**
     * Функция распределения обращения
     */
    function reassign_appealnumber(reqbyid, reg_status, login){
        //let reassignjson = {requestNumbers:[req_item.appealNumber],role:role,user:tmp_regs[reg_index_min_count].login};
        //{"requestNumbers":["PKPVDMFC-2020-12-30-367882"],"role":"PKURP_PREREG","user":"osradzhabova"}
        let role = (reg_status == "find_object_to_extractions" ? "PKURP_INFO" : (reg_status == "reg_validations" ? "PKURP_REG" : "PKURP_PREREG"));
        let reassignjson = {requestNumbers:[reqbyid.appealNumber],role:role,user:login};
        console.log("Регистратор подобран. JSON data запроса переназначения:",reassignjson);
        /**
        * назначение на выбранного рега
        */
        let freassigned = false;
        if (plg_regs_reassign_debug_off_enable){
            let reassignreq = postAjaxData('http://ppoz-service-bal-01.prod.egrn:9001/manager/assign/reassign',reassignjson);
            console.log("Запос вернул", reassignreq);
            freassigned = true;
        } else {
            freassigned = true;
        }
    
                                            
        let count_kuvd = [];
        for(var j=0; j<reqbyid.statements.length; j++){
            if(count_kuvd.length>0){
                if ($.inArray(reqbyid.statements[j].idKUVDRecord, count_kuvd) < 0){
                    count_kuvd.push(reqbyid.statements[j].idKUVDRecord);
                }
            } else {
                count_kuvd.push(reqbyid.statements[j].idKUVDRecord);
            }
        }
        //console.log("Список заявлений: ",count_kuvd);
        
        /**
        *Запись о назначение в IndexedDB
        **/
        var db = new exDB();
        db.open(indexeddb, function () {
            db.table("reassigns").add({
                reassignReg: login,
                appealNumber: reqbyid.appealNumber,
                reassignDate: (new Date().getTime()), //время в милисекундах (1сек - 1000 мсек) от 1 января 1970 г. 00:00:00 по UTC
                kuvdCount: count_kuvd.length
                },function(r){
                    console.log("Запись в IndexedDB",r);
                }
            );
        });                      
        return freassigned;  
    }
    
    function runAjaxJSON(curentkey,json_list){  
        /**
         *Получаем распределяемые обращения.
         **/
        json_item = json_list[curentkey];
        $.ajax({
          url: url,
          dataType: "json",
          data: JSON.stringify(json_item)/*json/*JSON.stringify(json)*/,
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
                  
              if (today.getTime() != reasign_date.getTime()){
                reassigned_today = new Map();
                today = reasign_date;
              }                   

              if(reassigned_today.size <= 0){
                $.each(plg_regs_reassign_filter_list, function(index,value){
                  $.each(value.regs, function(index,value){ 
                    reassigned_today.set(value.login, {"count": 0, "percent": value.percent, "limit": typeof(value.limit) != "undefined" ? value.limit : 0});
                  });
                });              
              }
              console.log("reassigned_today:",reassigned_today);

              let reg_list = [];
              $.each(plg_regs_reassign_filter_list, function(index,value){
                
                /**
                 *подсчет количества по дням
                **/
                
                let regs = []; 
                
                //let reg_list_item = value.regs.split(',');
                let reg_list_item = [];
                
                for(let reg of value.regs){
                  if(typeof(reg.include) == "undefined" || reg.include != "off"){
                    reg_list_item.push(reg.login);                        
                  }
                }
                        
                $.each(reg_list_item, function(reg_index,reg_item){                  
                  //console.log(reg_item);
                  //            {"pageNumber":0,"pageSize":10,"statuses":["reg_validations"],"executionDate":{"dateFrom":"2020-12-31","dateTo":"2020-12-31"},"subjectRF":["12"],"executorDepartments":["12.053"],"executors":["asianeev"],"byActiveExecutor":true}
                  let regjson = {pageNumber:0,pageSize:1000,statuses:[reg_status],executors:[reg_item],byActiveExecutor:true};
                  let req = postAjaxData('http://ppoz-service-bal-01.prod.egrn:9001/manager/requests',regjson);
                  //console.log("Запрос в работе у "+reg_item,regjson);
                  //console.log("В работе у "+reg_item,req);
                  
                  let count_date = [];
                  $.each(req.requests, function(request_index,request_item){
                    let date = request_item.executionDate.substr(0,10);
                    count_date[date] = (typeof(count_date[date]) == "undefined" ? 1 : count_date[date] + 1);                  
                  });
                  
                  let reg = {login: reg_item, unlim: (typeof(value.unlim) != "undefined" && value.unlim), count: req.requests.length, today: reasign_date, /*reassigned_today: reassigned_today[reg_item],*/ count_date: count_date};
                  
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
                 *вставка скиска регов по параметрам фильтра
                **/
                reg_list.push({group:value.group,json_filter:value.json_filter, regs: regs});
                                                                
              }); 
              console.log('reg_list:',reg_list);
              //plg_regs_reassign_filter_list[0].senderjson_filter
              
              //console.log(reg_list);
              $.each(data.requests, function(index,req_item){
                let date = req_item.executionDate.substr(0,10);
                let reassigned = false;   
                
                /**
                 *получаем обращение
                **/
                url_byId = "http://ppoz-service-bal-01.prod.egrn:9001/manager/requests/byId?id=".concat(req_item.appealNumber);
                let reqbyid = getAjaxData(url_byId);                
                console.log("Обращение",reqbyid);
                
                /**
                 * Поиск и назначение из списока обращений назначаемых на рега 
                 */
                for(let appealnumber_item of plg_regs_reassign_appealnumber_list){
                    if(reqbyid.appealNumber === appealnumber_item.appealnumber){
                        reassigned = reassign_appealnumber(reqbyid, reg_status, appealnumber_item.reg);
                        reassigned_today.set(appealnumber_item.reg, {"count":reassigned_today.get(appealnumber_item.reg).count + 1,"limit":reassigned_today.get(appealnumber_item.reg).limit});
                        //console.log("Колличество после назначения:",tmp_regs);
                        break;
                    }
                }                
                if (!reassigned){
                  /**
                   *подбираем рега для назначения
                  **/
                  console.log("<----------------Перебор условия фильтров---------------->");
                  let tmp_regs = [];
                  console.log("Собираем список регов из подхлдящийх категорий фильтров.");
                  $.each(reg_list, function(index,reg_list_item){                  
                    //console.log("Категория регов с соответствующими свойствами обращения");
                    //console.log("JSON фильтр",reg_list_item);
                    /*let json_filter_match = reg_list_item.json_filter.match(/"'"+reqbyid.senderName+"'"/g);
                    console.log(json_filter_match);*/
                    /**
                     *Выбор списка регов по источнику поступления или другому признаку деления пользователей.                  
                    **/
                    //if(reg_list_item.json_filter.indexOf("'"+reqbyid.senderName+"'")>=0){                                    
                    if(check_JSON_Filter(reg_list_item.json_filter,reqbyid) === true){
                      console.log("Категория предварительно подобрана.");
                      console.log("JSON фильтр",reg_list_item);
                      /**
                       * Собираем список регов в tmp_regs если лимит не исчерпан
                       */
                      $.each(reg_list_item.regs, function(reg_index,reg_item){
                          if (reg_item.unlim || reassigned_today.get(reg_item.login).limit > reassigned_today.get(reg_item.login).count || reassigned_today.get(reg_item.login).limit === 0){
                              tmp_regs.push(reg_item);
                          }
                      });
                    }
                  });
                  console.log("Предварительный список регов учитывая limit:", tmp_regs);
                  let unlim = false;
                  for(let tmp_regs_item of tmp_regs){
                      unlim = tmp_regs_item.unlim;
                      if (unlim) break;
                  }
                                    
                  if(unlim){
                    let reg_index = 0;
                    while (tmp_regs.length>reg_index){
                        let login = tmp_regs[reg_index].login;
                        if (!tmp_regs[reg_index].unlim){
                            tmp_regs.splice(reg_index,1);
                        } else {
                            reg_index++;
                        }
                    }
                    console.log("Cписок регов после проверки на unlim:", tmp_regs);
                  }
                  /**
                   * Убираем регов по проценту назначения если количество не соответствует.
                   * Сначало находим колличество обращений соответствующее 100%-ам назначенных за сегодня по регу.
                   */                  
                  let reassigned_today_max_count = 0;
                  $.each(tmp_regs, function(reg_index,reg_item){
                    if (reassigned_today.get(reg_item.login).count > reassigned_today_max_count){                        
                        reassigned_today_max_count = reassigned_today.get(reg_item.login).count;
                    }
                  });
                  let reg_index = 0;
                  while (tmp_regs.length>reg_index){
                    let login = tmp_regs[reg_index].login;
                    if (!tmp_regs[reg_index].unlim && reassigned_today.get(login).count > (reassigned_today.get(login).percent/100) * reassigned_today.get(login).count){
                        tmp_regs.splice(reg_index,1);
                    } else {
                        reg_index++;
                    }
                  }                
                  console.log("Подобранные реги после чистки по %:",tmp_regs);
                  
                  if (tmp_regs.length>0){
                    /**
                     *Поиск рега с наименьшим количеством на дату исполнения по регламенту распределяемого обращения
                    **/
                    let reg_index_min_count = -1;
                    let reg_date_min_count = 9999;                    
                    if (plg_regs_reassign_type == "result"){
                        /**
                         * Получаем рега с минимальным количеством обращений на дату исполнения по регламенту распределяемого обращения.
                         */
                        $.each(tmp_regs, function(reg_index,reg_item){
                            reg_item.count_date[date] = (typeof(reg_item.count_date[date]) == "undefined" ? 0 : reg_item.count_date[date]);
                            if (reg_item.count_date[date] < reg_date_min_count){
                                reg_date_min_count = reg_item.count_date[date];
                                reg_index_min_count = reg_index;  
                            }                      
                        });
                    } else {
                        /**
                         * Получаем мнимальное назначенных в текущий момент.                         
                         */
                        let reassigned_today_min_count = 9999;
                        $.each(tmp_regs, function(reg_index,reg_item){
                            //for(let key of reassigned_today.keys()){                        
                                if (reassigned_today.get(reg_item.login).count < reassigned_today_min_count){                        
                                    reassigned_today_min_count = reassigned_today.get(reg_item.login).count;
                                }
                            //}
                        });
                        /**
                         * Получаем рега с минимальным количеством обращений на дату исполнения регламенту распределяемого обращения.
                         * Проверяются только те у которых меньше всех назначенных обращений за сегодня.
                         */
                        let reg_date_min_count = 9999;
                        $.each(tmp_regs, function(reg_index,reg_item){                        
                            reg_item.count_date[date] = (typeof(reg_item.count_date[date]) == "undefined" ? 0 : reg_item.count_date[date]);
                            if (reg_item.count_date[date] < reg_date_min_count && reassigned_today_min_count == reassigned_today.get(reg_item.login).count/*reassigned_today[reg_item.login]*/){
                                reg_date_min_count = reg_item.count_date[date];
                                reg_index_min_count = reg_index;  
                            }                      
                        });
                    }
                    /**
                     *назначение обращения на подобранного рега
                    **/
                    if (reg_index_min_count >= 0){
                        tmp_regs[reg_index_min_count].count_date[date] = tmp_regs[reg_index_min_count].count_date[date] + 1;                      
                        /**
                         * Проставляем в списоке фильтров актуальное количество назначеных обращений
                         */
                        /*$.each(reg_list, function(index,reg_list_item){
                            $.each(reg_list_item.regs, function(reg_index,reg_item){
                                if(reg_item.login === reg_list[index].regs[reg_index].login){
                                    reg_list[index].regs[reg_index].count_date[date] = tmp_regs[reg_index_min_count].count_date[date];                      
                                }
                            });                            
                        });*/
                        
                        //console.log("Подобранный рег",tmp_regs[reg_index_min_count]);
                        reassigned = reassign_appealnumber(reqbyid, reg_status, tmp_regs[reg_index_min_count].login);
                        reassigned_today.set(tmp_regs[reg_index_min_count].login, {"count":reassigned_today.get(tmp_regs[reg_index_min_count].login).count + 1,"limit":reassigned_today.get(tmp_regs[reg_index_min_count].login).limit});
                        console.log("Колличество после назначения:",tmp_regs);
                    }
                  }
                }
                if (reassigned === false){
                    console.log("!!!!!!!!!!!По обращению не подобрана категория регов.!!!!!!!!!!!"); 
                }
              });
            }
            //result = data;
            //$(selctor).html(data.requests.length);
            if (++curentkey < json_list.length){
                runAjaxJSON(curentkey, json_list);
            }
          } 
        });
    }    
    
    if(document.webkitVisibilityState == 'visible'){      
      //let plg_regs_reassign_reassign_enable = await getLocalStorageValue('plg_regs_reassign_reassign_enable');
      if(plg_regs_reassign_reassign_enable == true){
        runAjaxJSON(0,json_list);       
      }    
    }
  }, timeout);
})();    
//});