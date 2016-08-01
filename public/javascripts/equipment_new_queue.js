var typeArray = [] // array that keep type of the equipments
var html
var WLP_arr = ["Pro-8a 2400 AirEUR", "Century Stand", "ProHead", "Profoto Air Remote"]
var WLP_val = [2, 4, 4, 1]
var WLB_arr = ["Broncolor ScoroE 3200", "Century Stand", "Lamp Base Pulso G+reflector", "Transceiver RSF2 Broncolor"]
var WLB_val = [2, 4, 4, 1]
var WLP = {}
var WLB = {}
var first = true
$(document).ready(function () {
  setInitValEquip()
  $(document).on("click", "#button", function () { // accordion for binding event click on + - button update value
    var $button = $(this)
    var oldValue = $button.parent().find("input").val()
    if ($button.text() == " +") {
      var newVal = parseFloat(oldValue) + 1
    } else {
      // Don't allow decrementing below zero
      if (oldValue > 0) {
        var newVal = parseFloat(oldValue) - 1
      } else {
        newVal = 0
      }
    }
    $button.parent().find("input").val(newVal)
    if (newVal == "0") {
      $button.parent().css({
        "color": "#979696",
        "background-color": "#C0C0C0"
      })
    } else {
      $button.parent().css({
        "color": "black",
        "background-color": "white"
      })

    }

  })
  $(document).on("click", ".bron", function () {
    $(this).parent().find(".list-group-item").find('.value_equip').each(function (index, el) {
      if ($(el).val() == 0) {
        $(el).parent().slideToggle('fast')
      }
    })
  })
  $(document).on("click", ".btn-hide", function () {
    showAll($(this))
  })

  function resetValEqiup(object) {
    object.find(".list-group-item").find('.value_equip').each(function (index, el) {
      $(el).val(0)
      $(el).parent().css({
        "color": "#979696",
        "background-color": "#C0C0C0"
      })
    })
  }

  function hideZeroEquip(object) {
    object.find(".list-group-item").find('.value_equip').each(function (index, el) {
      if ($(el).val() == 0) {
        $(el).parent().hide('fast')
      } else {
        $(el).parent().show('slow')
      }
    })
  }

  function showAll(object) {
    if (object.text() == "Hide all") {
      object.text("Show all")
      object.parent().parent().parent().find(".list-group-item").each(function (index, el) {
        $(el).find('.value_equip').each(function (index, el2) {
          if ($(el2).val() == 0) {
            $(el2).parent().slideUp('fast')
          }

        })

      })
    } else {
      object.text("Hide all")
      object.parent().parent().parent().find(".list-group-item").each(function (index, el) {
        $(el).find('.value_equip').each(function (index, el2) {
          if ($(el2).val() == 0) {

            $(el2).parent().slideDown('fast')
          }

        })

      })
    }
  }

  $(document).on("change", ".equipment-set", function () { // only one check box and be checked
    var parent = $(this).parent().parent().parent()
    resetValEqiup(parent)
    var checked = $(this).val()
    if (checked == "With lighting Prophoto") {
      checkEquipVal(WLP, parent)
    }
    if (checked == "With lighting Broncolor") {
      checkEquipVal(WLB, parent)
    }
    if (checked == "No lighting") {
      resetValEqiup(parent)
    }
    hideZeroEquip(parent)
  })

  function checkEquipVal(type, object) {
    object.find(".list-group-item").each(function (index, el) {
      var eString = $(el).find('span').text()
      $.each(type, function (key, val) {
        if (eString == key) {
          $(el).find(".value_equip").val(val)
          $(el).css({
            'background-color': 'white',
            'color': 'black'
          })
        }
      })
    })
  }


  function setInitValEquip() {
    for (var i = 0; i < WLP_arr.length; i++) {
      WLP[WLP_arr[i]] = WLP_val[i]
    }
    for (var i = 0; i < WLB_arr.length; i++) {
      WLB[WLB_arr[i]] = WLB_val[i]
    }
  }
})
