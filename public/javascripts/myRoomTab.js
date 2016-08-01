//--------------------------------------------------------- assistant --------------------------------------------
function addNewAssistantHandler(ass_name) {
  var that = this
  $.get("/assistant_form", function(assistant_form) {
    var $assistant_form = $(assistant_form)
    $assistant_form.appendTo($(that).parents('.assistant-group-form')).hide().show('fast')
  })
}
function deleteAssistantHandler() {
  $(this).closest('.form-group').hide('fast', function() {
    $(this).remove()
  })
}
$(document).on("click", ".delete_assistant", deleteAssistantHandler)
$(document).on("click", ".add_assistant", addNewAssistantHandler)
//--------------------------------------------------------- myRoomTab --------------------------------------------
var myRoomTab = {
  id: 0,
  selected: [],
  counter: 0,
  initialize: function () {
    myRoomTab.checkHideAddRoom ()
    $(document).on("click", ".close", myRoomTab.clickClose)
    $(document).on('click', '.add-room', myRoomTab.clickAdd)
    $(document).on("change", ".room-selector", myRoomTab.changeRoom)
    $(document).on("change", "#assignment_selector", myRoomTab.changeAssignmentHandler)
  },
  reset: function () {
    $(".tab-content").empty()
    $('.nav-tabs').find('li').not(".add-room").remove()
    myRoomTab.id = 0
    myRoomTab.selected = []
    myRoomTab.counter = 0
  },
  deleteTab: function (tab) {
    var id = $(tab).parent().attr('href') // find id of the tab param
    var ideq = id + "eq"
    // room deleting
    $('.nav-tabs').find("a[href=" + id + "]").remove() // remove nav-tabs li room
    $('.tab-content').find(id).remove() // remove tab content room
    $('.nav-tabs-room').find('a:first').tab('show')
    // equipment deleting
    $('.nav-tabs').find("a[href=" + ideq + "]").remove() // remove nav-tabs li eq
    $('.tab-content').find(ideq).remove() // remove tab content eq
    $('.nav-tabs-equipment').find('a:first').tab('show')
    myRoomTab.counter--
    $(".add-room").show()
  },
  addTab: function (callback, subQueue, assignment) { // add another room tab
    var data = {
      id: "room" + myRoomTab.id,
      assignment: $("#assignment_selector").val()
    }
    if (assignment != undefined) {
      data.assignment = assignment
    }
    var room_name
    $.get("/assistant_form", function (assistant_form) {
      $.get("/main-app-room", data, function (roomTabObject) {
        var $roomTabObject = $(roomTabObject)
        var max_room = $roomTabObject.find(".room-selector").find("option").length
        if (myRoomTab.counter + 1 == max_room) {
          $(".add-room").hide()
        } else {
          $(".add-room").show('fast')
        }
        if (myRoomTab.counter < max_room) {
          $roomTabObject.find(".room-selector option").each(function(index, el) { // check next room to bechange
            var room = $(el).val()
            if (myRoomTab.selected.indexOf(room) == -1) {
              el.selected = true
              room_name = $roomTabObject.find(".room-selector option:selected").text().toString()
              $roomTabObject.find(".tab-header").text(room_name)
              return false
            }

          })
          // date setting
          if (subQueue == undefined) {
            $roomTabObject.find('.datepicker').multiDatesPicker({ // initialize date picker
              dateFormat: "y-m-d"
            })
          } else {
            // when view queue call
            $roomTabObject.find(".datepicker").multiDatesPicker({
              dateFormat: "y-m-d",
              addDates: subQueue.shooting_date.map(function(index, elem) {
                return new Date(index)
              }),
              defaultDate: new Date(subQueue.shooting_date)
            })
            $roomTabObject.find(".room-selector option[value=" + subQueue.room + "]").prop('selected', true)
            room_name = $roomTabObject.find(".room-selector option:selected").text() // change room name due to ejs
            $roomTabObject.find("#status_selector option[value=" + subQueue.status + "]").prop('selected', true)
            $roomTabObject.find(".time_form option[value='" + subQueue.time + "']").prop('selected', true)
            $roomTabObject.find(".Photographer_form").val(subQueue.photographer)
            subQueue.assistant.map(function(el, index) {
              if (el != null) {
                if (index == 0) {
                  $roomTabObject.find(".first-assistant").val(el)
                } else {
                  var $assistant_form = $(assistant_form)
                  $assistant_form.find("#assistant_form").val(el)
                  $assistant_form.appendTo($roomTabObject.find('.assistant-group-form'))
                }
              }
            })
          }
          $.get("/equipment-panel", data, function(equipmentTabObject) {
            //append to tab content
            var $nav_tab = $roomTabObject.find('.nav-tabs li')
            //append to nav tabs
            $roomTabObject.find('.tab-pane').appendTo('.tab-content-room')
            $nav_tab.insertBefore('.add-room')
            $('.tab-content-room').find('.room-selector').each(function(index, el) { // add selected room
              var room = $(el).val()
              if (myRoomTab.selected.indexOf(room) == -1) {
                myRoomTab.selected.push(room)
              }
            })
            var $equipmentTabObject = $(equipmentTabObject)
            // when view queue call
            if (assignment != undefined) {
              $equipmentTabObject.find('.list-group-item span').each(function(index, el) {
                if (subQueue.equipments[$(el).text()] != undefined) {
                  $(el).parent().find(".value_equip").val(subQueue.equipments[$(el).text()])
                  $(el).parent().css({
                    display: '',
                    color: 'black',
                    'background-color': 'white'
                  })
                }
              })
            }
            if (room_name == "Onscreen room") {
              $equipmentTabObject.find('.tab-pane').hide()
              $equipmentTabObject.find('.nav-tabs li').hide()
            }
            //append to tab content
            $equipmentTabObject.find('.tab-pane').appendTo('.tab-content-equipment')
            $nav_tab = $equipmentTabObject.find('.nav-tabs li')
            //append to nav tabs
            $nav_tab.appendTo('.nav-tabs-equipment')
            $(".panel-collapse").collapse()
            myRoomTab.reCheckRoomOption()
            myRoomTab.updateHeader("#room" + myRoomTab.id, room_name)
            myRoomTab.id++
            myRoomTab.counter++
            callback()
          })
        }
      })
    })
  },
  clickClose: function() {
    myRoomTab.deleteTab(this)
    myRoomTab.reCheckRoomOption()
  },
  clickAdd: function() {
    myRoomTab.addTab(function() {
      $(".nav-tabs li:nth-last-child(2) a").tab('show')
    })
  },
  changeRoom: function() {
    var val = $(this).find("option:selected").text()
    var id = "#" + $(this).parents(".tab-pane").prop('id')
    var ideq = id + "eq"
    myRoomTab.updateHeader(id, val)
    myRoomTab.reCheckRoomOption()
    var $tabcontent = $(".tab-content-equipment").find(id + "eq")
    var $navtab = $(".nav-tabs").find("a[href='" + ideq + "']").parent()
    if (val == "Onscreen room") {
      $tabcontent.css('display', 'none')
      $navtab.css('display', 'none')
      resetValEqiup($tabcontent)

    } else {
      $tabcontent.css('display', '')
      $navtab.css('display', '')
    }
  },
  updateHeader: function (idTab, val) {
    var id = idTab
    var ideq = id + "eq"
    $('.tab-content').find(id).find(".tab-header").text(val)
    $('.nav-tabs').find("a[href='" + id + "']").find(".tab-header").text(val)
    $('.tab-content').find(ideq).find(".tab-header").text(val)
    $('.nav-tabs').find("a[href='" + ideq + "']").find(".tab-header").text(val)
  },
  reCheckRoomOption: function () {
    myRoomTab.selected = []
    $(".room-selector").each(function(index, el) {
      myRoomTab.selected.push($(el).val())
    })
    $(".room-selector").each(function(index, el) {
      $(el).find('option').each(function(index, els) {
        if ($.inArray($(els).val(), myRoomTab.selected) != -1) {
          if ($(el).val() != $(els).val()) {
            $(els).css('display', 'none')
          }
        } else {
          $(els).css('display', '')
        }
      })
    })
  },
  checkHideAddRoom: function() {
    var ass = $("#assignment_selector").val()
    if (ass == "Equipment rental" || ass == "Onscreen room") {
      $(".add-room").hide()
    } else {
      $(".add-room").show()
    }
  },
  changeAssignmentHandler: function(e) {
    e.preventDefault()
    myRoomTab.reset()
    myRoomTab.clickAdd()
    myRoomTab.checkHideAddRoom()
  }
}
myRoomTab.initialize()

function resetValEqiup(object) {
  object.find(".list-group-item").find('.value_equip').each(function(index, el) {
    $(el).val(0)
    $(el).parent().css({"color": "#979696","background-color": "#C0C0C0"}).hide()
  })
  object.find(".equipment-set option:first").prop('selected', 'true')
}
