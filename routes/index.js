var express = require('express');
var router = express.Router(); // get router
var faker = require('faker');
var mysql = require('../module/mysql_connection');
var async = require('async');
var connection = mysql.createConnection();
/* GET login  page. */
router.get('/', function(req, res, next) {

  res.render('index');
  console.log("root router connected");
});

router.get('/main-app-room', function(req, res, next) {
  res.render('main-app-room', {
    id: req.query.id,
    assignment: req.query.assignment
  });
})

router.get('/assistant_form', function(req, res, next) {
  res.render('assistant_form');
})

router.post('/insert_queue', function(req, res, next) {
  var job_data = [];
  var assistant = [];
  var shooting_date = [];
  var equipment = [];
  var booking_data = { // set booking data
    QID: req.body.qid,
    assignment: req.body.assignment,
    client: req.body.client,
    job_description: req.body.job_description
  }
  req.body.subQueue.map(function(subQueue, index) { //set job data
    var JID = req.body.qid + "-" + index;
    var QID = req.body.qid;
    var status = subQueue.status;
    var time_start = subQueue.time;
    var photographer = subQueue.photographer;
    var RID = subQueue.room
    job_data.push([JID, QID, status, time_start, photographer, RID]);
    if (subQueue.assistant.length > 0) {
      subQueue.assistant.map(function(ass, index_a) {
        if (ass.replace(/ /g, '') != "") {
          assistant.push([JID, QID, ass]);
        }
      });
    }
    subQueue.shooting_date.map(function(date, index_d) { // set
      shooting_date.push([JID, QID, date]);
    })

    for (var key in subQueue.equipments) {
      if (subQueue.equipments.hasOwnProperty(key)) {
        equipment.push([JID, QID, key, subQueue.equipments[key]]);
      }
    }
  });
  connection.getConnection(function(err, connection) {
    // connected! (unless `err` is set)
    connection.beginTransaction(function(err) {
      var query_insert_booking = "INSERT INTO booking SET?";
      var query_insert_job = "INSERT INTO job(JID,QID,status,time_start,photographer,RID) VALUE?";
      var query_insert_assistant = 'INSERT INTO assistance(JID,QID,assistance) VALUE?';
      var query_insert_shooting_date = 'INSERT INTO shooting_date(JID,QID,shooting_date) VALUE?';
      var query_insert_job_use_n_equip = "INSERT INTO job_use_n_equip(JID,QID,name_equipment,amount) VALUE?";
      async.waterfall([
        function(next) {
          connection.query(query_insert_booking, booking_data, function(err, row, field) {
            if (err) {
              mysql.rollback(connection, err, res);
            } else {
              console.log(query_insert_booking + " complete.");
              next();
            }
          });
        },
        function(next) {
          connection.query(query_insert_job, [job_data], function(err, row, field) {
            if (err) {
              mysql.rollback(connection, err, res);
            } else {
              console.log(query_insert_job + " complete.");
              next();
            }
          });
        },
        function(next) {
          connection.query(query_insert_shooting_date, [shooting_date], function(err, row, field) {
            if (err) {
              mysql.rollback(connection, err, res);
            } else {
              console.log(query_insert_shooting_date + " complete.");
              next();
            }
          });
        },
        function(next) {
          if (assistant.length > 0) {
            connection.query(query_insert_assistant, [assistant], function(err, row, field) {
              if (err) {
                mysql.rollback(connection, err, res);
              } else {
                console.log(query_insert_assistant + " complete.");
                next();
              }
            });
          } else {
            next();
          }
        },
        function(next) {
          if (equipment.length != 0) {
            connection.query(query_insert_job_use_n_equip, [equipment], function(err, row, field) {
              console.log(query_insert_job_use_n_equip + " complete.");
              if (err) {
                mysql.rollback(connection, err, res);
              } else {
                next();
              }
            });
          } else {
            next();
          }
        },
      ], function(err) {
        if (err) throw err;
        mysql.commit(connection);
        res.send(err);
      });
    });
  });
});
router.post('/update_queue', function(req, res, next) {
  var job_data = [];
  var assistant = [];
  var shooting_date = [];
  var equipment = [];
  var jid_array = [];
  var booking_data = { // set booking data
    assignment: req.body.assignment,
    client: req.body.client,
    job_description: req.body.job_description
  }
  req.body.subQueue.map(function(subQueue, index) { //set job data
    var JID = req.body.qid + "-" + index;
    var QID = req.body.qid;
    var status = subQueue.status;
    var time_start = subQueue.time;
    var photographer = subQueue.photographer;
    var RID = subQueue.room;
    job_data.push([JID, QID, status, time_start, photographer, RID]);
    jid_array.push("'" + JID + "'");
    if (subQueue.assistant.length > 0) {
      subQueue.assistant.map(function(ass, index_a) {
        if (ass.replace(/ /g, '') != "") {
          assistant.push([JID, QID, ass]);
        }
      });
    }
    subQueue.shooting_date.map(function(date, index_d) { // set
      shooting_date.push([JID, QID, date]);
    });

    for (var key in subQueue.equipments) {
      if (subQueue.equipments.hasOwnProperty(key)) {
        equipment.push([JID, QID, key, subQueue.equipments[key]]);
      }
    }
  })
  connection.getConnection(function(err, connection) {
    // connected! (unless `err` is set)
    connection.beginTransaction(function(err) {
      var query_insert_booking = "UPDATE booking SET? WHERE booking.QID='" + req.body.qid + "'";
      var query_delete_job = "DELETE FROM job WHERE job.QID='" + req.body.qid + "'" + " AND " + "job.JID NOT IN (" + jid_array + ")";
      var query_replace_job = "REPLACE INTO job(JID,QID,status,time_start,photographer,RID) VALUE?";
      var query_replace_assistant = 'REPLACE INTO assistance(JID,QID,assistance) VALUE?';
      var query_replace_shooting_date = 'REPLACE INTO shooting_date(JID,QID,shooting_date) VALUE?';
      var query_replace_job_use_n_equip = "REPLACE INTO job_use_n_equip(JID,QID,name_equipment,amount) VALUE?";
      async.waterfall([
        function(next) {
          connection.query(query_insert_booking, booking_data, function(err, row, field) {
            if (err) {
              mysql.rollback(connection, err, res);
            } else {
              console.log(query_insert_booking + " complete.");
              next();
            }
          });
        },
        function(next) {
          connection.query(query_delete_job, function(err, row, field) {
            if (err) {
              console.log(query_delete_job);
              mysql.rollback(connection, err, res);
            } else {
              console.log(query_delete_job + " complete.");
              next();
            }
          });
        },
        function(next) {
          connection.query(query_replace_job, [job_data], function(err, row, field) {
            if (err) {
              mysql.rollback(connection, err, res);
            } else {
              console.log(query_replace_job + " complete.");
              next();
            }
          });
        },
        function(next) {
          connection.query(query_replace_shooting_date, [shooting_date], function(err, row, field) {
            if (err) {
              mysql.rollback(connection, err, res);
            } else {
              console.log(query_replace_shooting_date + " complete.");
              next();
            }
          });
        },
        function(next) {
          if (assistant.length > 0) {
            connection.query(query_replace_assistant, [assistant], function(err, row, field) {
              if (err) {
                mysql.rollback(connection, err, res);
              } else {
                console.log(query_replace_assistant + " complete.");
                next();
              }
            });
          } else {
            next();
          }
        },
        function(next) {
          if (equipment.length != 0) {
            connection.query(query_replace_job_use_n_equip, [equipment], function(err, row, field) {
              if (err) {
                mysql.rollback(connection, err, res);
              } else {
                console.log(query_replace_job_use_n_equip + " complete.");
                next();
              }
            });
          } else {
            next();
          }
        },
      ], function(err) {
        if (err) throw err;
        mysql.commit(connection);
        res.send(err);
      });
    });
  });
});
router.get('/room_new_queue', function(req, res, next) {
  var assignment = req.query;
  res.render('room_new_queue', {
    assignment: assignment
  });
});
//
//get add new booking page
router.get('/newQueue', function(req, res, next) {
  connection.query('SELECT COUNT(*) AS count FROM booking ', function(err, row, field) {
    var id = getQuotationID(row);
    res.render('newQueue', {
      qid: id,
      title: "Create new booking",
      page: "newQueue"
    });

  });

});
router.get('/equipment_new_queue', function(req, res, next) {
  res.render('equipment_new_queue');
});

router.get('/equipment-panel', function(req, res, next) {
  var query = "SELECT *,COUNT(Description) AS count FROM equipment GROUP BY Description ORDER BY type";
  connection.query(query, function(err, rows, fields) {
    var equipment = []
    var typeArray = []
    var equipments = {}
    rows.map((el,index)=>{
      if (equipments.hasOwnProperty(el.type)){
        equipments[el.type] = ({
          id: req.query.id,
          equipment: el.description
        })
      }else{
        equipments[el.type] = []
      }
    })
    rows.map(function(el, index) {
      if (typeArray.indexOf(el.type) == -1) {
        typeArray.push(el.type);
      }
    })
    var k = 0;
    for (var i = 0; i < typeArray.length; i++) {
      equipment[i] = [];
      for (var j = 0; j < rows.length; j++) {
        if (typeArray[i] == rows[j].type) {
          equipment[i][k] = rows[j].description;
          k++;
        }
      }
      k = 0;
    }
    var data = {
      typeArray: typeArray,
      equipment: equipment,
      id: req.query.id
    }

    res.render('equipment-panel', data);

  });

});

router.get('/dump_equipment_data', function(req, res, next) {

  var query = "SELECT *,COUNT(Description) AS count FROM equipment GROUP BY Description ORDER BY type";
  connection.query(query, function(err, rows, fields) {
    res.send(rows);

  });

});
router.post('/confirm_close_job', function(req, res, next) {
  var close_equip_data = [];
  var QID = req.session.QID;
  var OT = req.body.ot_form;
  for (var key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      if (key == "equip_item") {
        var equipString = req.body[key];
        for (var i = 0; i < equipString.length; i++) {
          close_equip_data.push([QID, equipString[i]]);
        }
      }
    }
  }
  var data = {
    status: 'Closed',
    OT: OT
  }
  if (close_equip_data.length > 0) {
    connection.query('INSERT INTO booking_use_equipment(QID,EID) VALUE?', [close_equip_data], function(err, row, field) {
      if (err) {
        console.log(err);
      } else {
        connection.query('UPDATE booking SET? WHERE QID=?', [data, QID], function(err, row, field) { // main data all QID and stuff
          if (err) {
            console.log("can't insert booking with error code " + err);
          } else {
            console.log("edit booking complete");
          }
        });
        res.redirect('confirm_close_job');
      }

    });
  } else {
    res.redirect('confirm_close_job');
  }


});
router.get('/confirm_close_job', function(req, res, next) {
  var QID = req.session.QID;
  res.render('confirm_close_job', {
    QID: QID
  });
});
router.get('/add_rent_equipment', function(req, res, next) {
  var query = "SELECT *,COUNT(Description) AS count FROM equipment GROUP BY Description";
  var temp = "";
  connection.query(query, function(err, rows, fields) {
    for (var i = 0; i < rows.length; i++) {
      if (i != 0) {
        temp = temp + rows[i].description + ",";
      }
    }
    res.render('add_rent_equipment', {
      data: temp
    });
  });
});
//get add show queues page
router.get('/queues', function(req, res, next) {
  res.render('queues');
});
router.get('/new_customer', function(req, res, next) {
  res.render('new_customer');
});
router.get('/confirm_create_queue', function(req, res, next) {
  res.render('confirm_create_queue')

});

router.get('/dump_equipment_data_unique', function(req, res, next) {
  var query = "SELECT * FROM equipment";
  connection.query(query, function(err, rows, fields) {
    res.send(rows);
  });
})
router.get('/queue_close/:QID', function(req, res, next) {
  var query_booking = "SELECT* FROM booking WHERE booking.QID=" + "'" + req.params.QID + "'";
  connection.query(query_booking, function(err, row, field) {
    if (err) {
      console.log(err)
    } else {
      var qid = row[0].QID;
      var client = row[0].client;
      var job_description = row[0].job_description;
      var assignment = row[0].assignment;

      res.render('queue_close', {
        qid: qid,
        client: client,
        job_description: job_description,
        assignment: assignment,
        title: "View queue " + qid,
        page: "queue_view"
      })
    }
  })
})


router.post('/dump_qid', function(req, res, next) {
  req.session.QID = req.body.QID;
  if (req.session.QID != null) {
    res.send(true)
  } else {
    res.send(false);
  }

});
router.get('/edit', function(req, res, next) {
  res.render('edit');

});

router.get('/queue_view/:QID', function(req, res, next) {
  var query_booking = "SELECT* FROM booking WHERE booking.QID=" + "'" + req.params.QID + "'";
  connection.query(query_booking, function(err, row, field) {
    if (err) {
      console.log(err);
    } else {
      var qid = row[0].QID;
      var client = row[0].client;
      var job_description = row[0].job_description;
      var assignment = row[0].assignment;

      res.render('queue_view', {
        qid: qid,
        client: client,
        job_description: job_description,
        assignment: assignment,
        title: "View queue " + qid,
        page: "queue_view"
      })
    }
  })

})
router.get('/queue_edit/:QID', function(req, res, next) {
  console.log(req.params.QID)
  var query_booking = "SELECT* FROM booking WHERE booking.QID=" + "'" + req.params.QID + "'";
  connection.query(query_booking, function(err, row, field) {
    if (err) {
      console.log(err);
    } else {
      var qid = row[0].QID;
      var client = row[0].client;
      var job_description = row[0].job_description;
      var assignment = row[0].assignment;

      res.render('queue_edit', {
        qid: qid,
        client: client,
        job_description: job_description,
        assignment: assignment,
        title: "Edit queue " + qid,
        page: "queue_edit"
      });
    }
  });

});
router.post('/queue_data/:QID', function(req, res, next) {
  var QID = req.params.QID
  var query_booking = "SELECT* FROM booking WHERE booking.QID=" + "'" + QID + "'";
  var query_job = "SELECT* FROM booking LEFT JOIN job ON booking.QID=job.QID LEFT JOIN room ON job.RID=room.RID WHERE booking.QID=" + "'" + QID + "'";
  var query_shooting_date = "SELECT job.JID,DATE_FORMAT(shooting_date,'%Y-%m-%d') shooting_date FROM job LEFT JOIN shooting_date on job.JID=shooting_date.JID WHERE job.QID=" + "'" + QID + "'";
  var query_assistant = "SELECT job.JID,assistance FROM job LEFT JOIN assistance on job.JID=assistance.JID WHERE job.QID=" + "'" + QID + "'";
  var query_equipment = "SELECT job.JID,name_equipment,amount FROM job LEFT JOIN job_use_n_equip on job.JID=job_use_n_equip.JID WHERE job.QID=" + "'" + QID + "'";
  var booking_data;
  var job_data;
  var job_shooting_date;
  var job_assistant;
  var job_equipment;
  var Queue = new queue();
  async.waterfall([
    function(next) {
      connection.query(query_booking, function(err, row, field) {
        if (err) {
          console.log(err);
        } else {
          Queue.qid = row[0].QID;
          Queue.client = row[0].client;
          Queue.job_description = row[0].job_description;
          Queue.assignment = row[0].assignment;
          next();
        }
      });
    },
    function(next) {
      connection.query(query_job, function(err, row, field) {
        if (err) {
          console.log(err);
        } else {
          row.map(function(el, index) {
            SubQueue = new subQueue();
            SubQueue.jid = el.JID;
            SubQueue.status = el.status;
            SubQueue.room = el.RID
            SubQueue.photographer = el.photographer;
            SubQueue.time = el.time_start.slice(0, 5);
            Queue.subQueue.push(SubQueue);
          })
          next();
        }
      });
    },
    function(next) {
      connection.query(query_shooting_date, function(err, row, field) {
        if (err) {
          console.log(err);
        } else {
          Queue.subQueue.map(function(el, index) {
            row.map(function(el2, index2) {
              if (Queue.subQueue[index].jid == el2.JID) {
                Queue.subQueue[index].shooting_date.push(el2.shooting_date);
              }
            })
          })

          next();
        }
      });
    },
    function(next) {
      connection.query(query_assistant, function(err, row, field) {
        if (err) {
          console.log(err);
        } else {
          Queue.subQueue.map(function(el, index) {
            row.map(function(el2, index2) {
              if (Queue.subQueue[index].jid == el2.JID) {
                Queue.subQueue[index].assistant.push(el2.assistance);
              }
            })
          })

          next();
        }
      });
    },
    function(next) {
      connection.query(query_equipment, function(err, row, field) {
        if (err) {
          console.log(err);
        } else {
          Queue.subQueue.map(function(el, index) {
            row.map(function(el2, index2) {
              if (Queue.subQueue[index].jid == el2.JID) {
                Queue.subQueue[index].equipments[el2.name_equipment] = el2.amount;
              }
            })
          })
          next();
        }
      });

    },
  ], function(err) {
    if (err) throw err;

    res.send(Queue);

  });

});
router.get('/dump_qid_status', function(req, res, next) {
  connection.query("SELECT type FROM booking WHERE QID=?", [
    [req.session.QID]
  ], function(err, row, fields) {
    if (err) {
      console.log(err);
    }
    res.send(row);
  });
});


//get equipment page
router.get('/equipment_list', function(req, res, next) {
  console.log("equipment_list router connected");
  res.render('equipment_list');

});
router.get('/equipment_table', function(req, res, next) {
  console.log("equipment_list router connected");

  var catagories = req.query.catagories; // the catagories the selected
  var count = req.query.count; // boolean value that show count or not
  if (count == 'false') { // if count == false means that we show the unique type.
    connection.query('SELECT * FROM equipment WHERE type=' + '"' + catagories + '"', function(err, rows, fields) {
      if (err) {
        console.log('cannot query the statement');
        throw err;
      }
      res.render('equipment_table', {
        equip: rows
      });


    });
  }

});
router.get('/equipment_table_count', function(req, res, next) {
  console.log("equipment_table_count router connected");

  var catagories = req.query.catagories;
  var count = req.query.count;
  connection.query('SELECT *,COUNT(description) AS count FROM equipment WHERE type=' + '"' + catagories + '"' + " GROUP BY description", function(err, rows, fields) {
    if (err) {
      console.log('cannot query the statement');
      throw err;
    } else {
      res.render('equipment_table_count', {
        equip: rows
      });

    }

  });


});
router.get('/queue_table', function(req, res, next) {
  var sort_type = req.query.data;
  var data = [];
  var found = false;
  var query_job_shooting_date = "SELECT* FROM (job LEFT JOIN room ON job.RID=room.RID) LEFT JOIN shooting_date ON job.JID=shooting_date.JID " +
  "WHERE YEARWEEK(shooting_date.shooting_date, 1) = YEARWEEK(CURDATE()+INTERVAL " + sort_type + " WEEK, 1) " +
  "ORDER BY shooting_date.shooting_date";
  var query_job_date_booking = "SELECT* FROM booking LEFT JOIN shooting_date ON booking.QID=shooting_date.QID";
  async.waterfall([
    function(next) {
      connection.query(query_job_shooting_date, function(err, row, field) {
        if (err) {
          console.log(err);
        } else {
          var weekArray = getWeeks(sort_type);
          row.map(function(el, index) {
            data.push({
              date: el.shooting_date,
              JID: el.JID,
              client: "",
              job_description: "",
              time: el.time_start,
              assignment: el.assignment,
              room: el.room_name,
              status: el.status,
              Photographer: el.photographer,
              QID: el.QID
            });
          });
          for (var i = 0; i < weekArray.length; i++) { // consider improve alg later
            for (var j = 0; j < row.length; j++) {
              if (formatDate(weekArray[i]) == formatDate(row[j].shooting_date)) {
                found = true;
                break;
              } else {
                found = false;
              }
            }
            if (!found) {
              data.push({
                date: weekArray[i],
                JID: "",
                client: "",
                job_description: "",
                time: "",
                assignment: "",
                room: "",
                status: "",
                Photographer: "",
                QID: ""
              });
            }
          }
          data.sort(function(a, b) {
            return new Date(a.date) - new Date(b.date)
          });
          data.map(function(el, index) {
            el.date = formatDate(el.date);
          })
          next();
        }
      })
    },
    function(next) {
      connection.query(query_job_date_booking, function(err, row, field) {
        if (err) {
          console.log(err);
        } else {
          data.map(function(el, index) {
            row.map(function(el2, index2) {
              if (el.date == formatDate(el2.shooting_date) && el.JID == el2.JID) {
                data[index].client = el2.client;
                data[index].job_description = el2.job_description;
                data[index].assignment = el2.assignment;
                data[index].QID = el2.QID;
              }
            })
          })
          next();
        }
      });
    },
  ], function(err) {
    if (err) throw err;
    res.render('queue_table', {
      data: data
    });

  });


});


router.post('/queue_table', function(req, res, next) {
  var temp = req.body.data;
});

//post to dummy page on login_auth and redirect back
router.post('/login_auth', function(req, res, next) {
  req.session.user = req.body.username;
  if (req.session.user === 'jarindr') {
    res.redirect('equipment_list');
  } else {
    res.redirect('/');
  }
  console.log("root loggedIn connected");

});

router.post('/confirm_add_rent_equipment', function(req, res, next) {
  var str = req.body.supplier_form + req.body.description_form;
  var UID = str;
  var data = {
    supplier: req.body.supplier_form,
    description: req.body.description_form,
    price: req.body.price_form,
    quantity: req.body.quantity_form,
    SUID: UID
  }
  connection.query("INSERT INTO rented_equipment SET?", data, function(err, row, field) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('confirm_add_rent_equipment');
    }
  });
});
router.get('/confirm_add_rent_equipment', function(req, res, next) {
  res.render('confirm_add_rent_equipment');
});
router.get('/dump_rent_equipment', function(req, res, next) {
  connection.query("SELECT* FROM rented_equipment", function(err, row, field) {
    res.send(row);
  });

});
router.get('/confirm_edit_queue', function(req, res, next) {
  res.render('confirm_edit_queue');
});
router.post('/queues', function(req, res, next) {
  console.log("get form");
  res.redirect('queues');
});
//get error page
router.get('/error', function(req, res, next) {
  res.render('error');

});


// useful function and helpers---------------------------------------------------------------------------------

//a dummy function for checkAuthorization will be move out and have its own module and import in after.
function checkAuth(req, res, next) {
  if (req.session.user === 'jarindr') {
    next();
  } else {
    res.redirect('/');
  }
}


// get weeks array from sort_type
function getWeeks(sort_type) {
  var dateArray = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var arrayWeek = [];
  var today, todayNumber, previousWeek, week, mondayNumber, monday, sunday, sundayNumber;
  var x = 0;
  previousWeek = 1; //For every week you want to go back the past fill in a lower number.
  today = new Date();
  todayNumber = today.getDay();
  var curr = new Date(); // get current date
  var getDayTemp;
  if (curr.getDay() == 0) {
    getDayTemp = 7;
  } else {
    getDayTemp = curr.getDay();
  }
  if (sort_type == 0) {
    var first = curr.getDate() - getDayTemp + 1; // First day is the day of the month - the day of the week
    for (var i = 0; i < 7; i++) {
      var firstday = new Date(curr.setDate(first));
      var date = firstday.getDate();
      var month = parseInt(firstday.getMonth()) + 1;
      var day = dateArray[firstday.getDay()];
      var year = firstday.getFullYear();
      var stringFullDate = day + " " + date + "-" + month + "-" + year;
      arrayWeek.push(firstday);
      first++;
    }
  } else {
    x = sort_type * 7;
    week = previousWeek * x;
    mondayNumber = 1 - getDayTemp + week
    for (var i = 0; i < 7; i++) {
      var firstday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayNumber);
      var date = firstday.getDate();
      var month = parseInt(firstday.getMonth()) + 1;
      var day = dateArray[firstday.getDay()];
      var year = firstday.getFullYear();
      var stringFullDate = day + " " + date + "-" + month + "-" + year;
      arrayWeek.push(firstday);
      mondayNumber++;
    }
  }
  return arrayWeek;

}

function formatDate(date) { // formate date to be day-date-month-year
  var dateArray = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var firstday = new Date(date);
  var date = firstday.getDate();
  var month = parseInt(firstday.getMonth()) + 1;
  var day = dateArray[firstday.getDay()];
  var year = firstday.getFullYear();
  var stringFullDate = day + " " + date + "-" + month + "-" + year;
  return stringFullDate;


}

function getQuotationID(row) {
  var date = new Date();
  var year = date.getFullYear().toString().substring(2);
  var month = date.getMonth() + 1;
  var QuotationID;
  var count = row[0].count.toString();
  month = month.toString();
  if (month.length == 1) month = "0" + month;
  if (count.length == 1) count = "000" + count;
  if (count.length == 2) count = "00" + count;
  if (count.length == 3) count = "0" + count;
  QuotationID = "Q" + year + month + count;
  return QuotationID;
}

// this is all the helper functions that used in here
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function arraysEqual(a1, a2) {
  return JSON.stringify(a1) == JSON.stringify(a2);
}

Array.prototype.insert = function(index, item) {
  this.splice(index, 0, item);
};

// queue class to send to client
function queue () {
  this.qid;
  this.client;
  this.job_description;
  this.assignment;
  this.subQueue = [];


}

function subQueue () {
  this.jid;
  this.room;
  this.photographer;
  this.shooting_date = [];
  this.status;
  this.time;
  this.assistant = [];
  this.equipments = {};
}
//export the routers
module.exports = router;
