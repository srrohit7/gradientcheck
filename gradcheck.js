//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
/// GradientCheck
/// Written by John Degenstein, Purdue University
/// Version 0.97
/// Date: February X, 2016
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//
//Copyright © 2016 Purdue University All rights reserved.
//
//Developed by: Purdue Catalysis Center, School of Chemical Engineering, Purdue University
//https://engineering.purdue.edu/~catalyst/
//
//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal with the Software without restriction, including without limitation the rights to use, copy, modify, //merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimers.
//Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimers in the documentation and/or other materials provided with the distribution.
//Neither the names of ??, nor the names of its contributors may be used to endorse or promote products derived from this Software without specific prior written permission.
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE CONTRIBUTORS OR COPYRIGHT HOLDERS //BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS WITH THE SOFTWARE.
//



//////////////////////////////////////////////////////////////////////
//this code is for hiding sections of calculated properties with the red "+" signs
$(document).ready(function(){
  $('#hide_mixing').on('click', function(){
    $('#mixing').toggle('fast');
  });

  $('#hide_mixing2').on('click', function(){
    $(' #gas_mixture').toggle('fast');
  });


  $('#hide_ndims').on('click', function(){
    $('#ndims').toggle('fast');
  });

  $('#hide_catprops').on('click', function(){
    $('#catprops').toggle('fast');
  });

  $('#hide_intgrad').on('click', function(){
    $('#intgrad').toggle('fast');
  });
/*
  $('#hide_holdup').on('click', function(){
    $('#trickle_bed1').toggle('fast');
  });
*/
  $('#hide_calculated').on('click', function(){
    $('#calculated').toggle('fast');
  });

  $('#hide_bedscalegrads').on('click', function(){
    $('#bedscalegrads').toggle('fast');
  });

  $('#hide_valtests').on('click', function(){
    $('#valtests').toggle('fast');
  });

  $('#hide_mears_disp').on('click', function(){
    $('#tbody_mears_disp').toggle('fast');
  });

  $('#hide_gierman_disp').on('click', function(){
    $('#tbody_gierman_disp').toggle('fast');
  });

  $('#hide_sie_walleffect').on('click', function(){
    $('#tbody_sie_walleffect').toggle('fast');
  });

  $('#hide_mears_radialintp').on('click', function(){
    $('#tbody_mears_radialintp').toggle('fast');
  });
});


//////////////////////////////////////////////////////////////////////
//used for math.format calls later to reformat number output
var val_out = {notation: 'auto', precision: 3}; // see http://mathjs.org/docs/reference/functions/format.html for further info

//////////////////////////////////////////////////////////////////////
//the below function triggers change for all input IDs in the document, in order to manually update the calculations
$(document).ready(function(){
  $("#calculate_all_fields").on('click', function (){
    var ids = $('input[id]').map(function() {
      return this.id;
    }).get();

    ids = ids.map(function(currentItem){
      return "#" + currentItem //make list of IDs prepended with a "#"
    });

    var idsJoined = ids.join(","); //make into a single long string

    $(idsJoined).trigger("change"); //triggers change to update later calculations
  });
});////RangaDN


//preinitialize myFile object, later used for logic check
var myFile = $('#form_data_json').prop('files');

////////////////////////////////////////////////////////////////////////////
// reads in an input JSON from user file
$(document).ready(function(){
  $("#form_data_json").on('change', function(){
    var myFile = $('#form_data_json').prop('files');
    var reader = new FileReader();

    reader.onload = function(event) { //wait for asynchronous load event to take place
      var myData = event.target.result;
      window.myData = myData;
    };

    if (myFile.length == 0) {
      var JSONdata = {}
    } else {
      var JSONdata = reader.readAsText(myFile.item(0));
    }
  });
});///RangaDN

////////////////////////////////////////////////////////////////////////////
//populates above input JSON file into the form itself
$(document).ready(function(){
  $("#populate_inputs").on('click', function(){
    $(".initialize").trigger("change");
    ////////////////////////
    var parsedJSON = $.parseJSON(window.myData);
    // next line looks for all input sections in html
    var $inputs = $('input'); //get inputs in HTML
    var $textarea = $('textarea'); //get textareas in HTML
    var $dropdowns = $('select'); //get dropdowns (aka select) in HTML
    $.each(parsedJSON, function(i, pair) {
      if (pair.name == "notes_section") { //hardcoded to id of the only textarea
        $textarea.filter(function() { //populates text area (currently only one) with text
          return pair.name == this.id;
        }).val(pair.value);
      } else if (/^dr_/i.test(pair.name)) { //looks for id that starts with dr_ to indicate dropdown
        $dropdowns.filter(function() { //populates dropdown (aka select) with text
          return pair.name == this.id;
        }).val(pair.value);
        $("#dr_cat_shape,#dr_num_reactants,#dr_num_products").trigger("change");//necessary to force HTML to trigger additional particle dimensions, and reactant/products
      } else if (/^ck_/i.test(pair.name)) { //looks for id that starts with ck_ to indicate checkbox
        $inputs.filter(function() {
          if (this.value == "on") { //if the value is on then send pair.name to parent
            return pair.name == this.id
          } else { //if the value is NULL then dont do anything, and the checkbox will KEEP its current state <-- not fixing this issue for now
            //do nothing
          }
        }).prop('checked',true);
      } else { //for everything else not included above
        $inputs.filter(function() { //populates input areas that match "id" with the JSON input
          return pair.name == this.id;
        }).val(pair.value);
      }
    });
  });
});///RangaDN

////////////////////////////////////////////////////////////////////////////
//function for hiding/showing additional particle dimensions for Spheres/Cylinders/Rings
$(document).ready(function(){
  $('#dr_cat_shape,#populate_inputs').on('change click', function(){
    if ($('#dr_cat_shape').val() == "Spheres"){$('#tbody_cat_shape_L').hide('fast');$('#tbody_cat_shape_Rin').hide('fast');} //hide both additional particle dimensions
    if ($('#dr_cat_shape').val() == "Cylinders"){$('#tbody_cat_shape_L').show('fast');$('#tbody_cat_shape_Rin').hide('fast');} //show L particle dimensions
    if ($('#dr_cat_shape').val() == "Rings"){$('#tbody_cat_shape_L').show('fast');$('#tbody_cat_shape_Rin').show('fast');} //show both additional particle dimensions
  });
});

////////////////////////////////////////////////////////////////////////////
//function for hiding/showing additional reactants and products and their property inputs and limiting reactant
$(document).ready(function(){
  $('#dr_num_reactants,#dr_num_products,#populate_inputs').on('keyup keydown change click', function(){///why do this?
    if ($('#dr_num_reactants').val() == "One" && $('#dr_num_products').val() == "One"){ //OPTION A -- hide 2 and 4, header reads A, B, C
      $('#tr_reactants_products_diluent_header').html('<td></td><td class="MainReact">Main<br>Reactant A</td><td>Product B</td><td>Diluent C</td><td></td>') //header reads A, B, C
      $('#tr_reactants_products_diluent_header_igdens').html('<td></td><td>Reactant A</td><td>Product B</td><td>Diluent C</td><td></td>') //header reads A, B, C
      $('#tr_reactants_products_diluent_header_fuller').html('<td></td><td>Reactant A</td><td>Product B</td><td>Diluent C</td><td></td>') //header reads A, B, C
      $('#tr_reactants_products_diluent_header_lebas').html('<td></td><td>Reactant A</td><td>Product B</td><td>Diluent C</td><td></td>') //header reads A, B, C
      $('#tr_reactants_products_diluent_header_joback').html('<td></td><td>Reactant A</td><td>Product B</td><td>Diluent C</td><td></td>')
      $('input.nar').css('max-width','110px'); //change width of input cells
      //hide BOTH 2 and 4
      $('#hide_molweight2,#hide_molweight4,#hide_fluidvisc2,#hide_fluidvisc4,#hide_heatcapacity2,#hide_heatcapacity4,#hide_thermalcond2,#hide_thermalcond4,#hide_molfrac2,#hide_molfrac4,#hide_res_gasdens2,#hide_res_gasdens4,#hide_difvol2,#hide_difvol4,#hide_column_dvol2,#hide_column_dvol4,#hide_column_vb2,#hide_column_vb4,#hide_molar_boil_vol2,#hide_molar_boil_vol4,#hide_liq_density2,#hide_liq_density4,#hide_wilke_assoc_phi2,#hide_wilke_assoc_phi4,#tbody_limitingreactant,#joback_2,#joback_4, #hide_gas_mole_fraction_2, #hide_gas_mole_fraction_4, #hide_liq_mole_fraction_2, #hide_liq_mole_fraction_4, #hide_henryconstant2, #hide_henryconstant4, #hide_criticaltemperature2, #hide_criticaltemperature4, #hide_criticalpressure2 , #hide_criticalpressure4, #hide_vaporpressure2, #hide_vaporpressure4, #hide_vaporliquidflash_2, #hide_vaporliquidflash_4 ').hide('fast');
    } else if ($('#dr_num_reactants').val() == "Two" && $('#dr_num_products').val() == "One"){ //OPTION B -- hide 4, header reads A, B, C, D
      $('#tr_reactants_products_diluent_header').html('<td></td><td class="MainReact">Main<br>Reactant A</td><td>Reactant B</td><td>Product C</td><td>Diluent D</td><td></td>') //header reads A, B, C, D
      $('#tr_reactants_products_diluent_header_igdens').html('<td></td><td>Reactant A</td><td>Reactant B</td><td>Product C</td><td>Diluent D</td><td></td>') //header reads A, B, C, D
      $('#tr_reactants_products_diluent_header_fuller').html('<td></td><td>Reactant A</td><td>Reactant B</td><td>Product C</td><td>Diluent D</td><td></td>') //header reads A, B, C, D
      $('#tr_reactants_products_diluent_header_lebas').html('<td></td><td>Reactant A</td><td>Reactant B</td><td>Product C</td><td>Diluent D</td><td></td>') //header reads A, B, C, D
       $('#tr_reactants_products_diluent_header_joback').html('<td></td><td>Reactant A</td><td>Reactant B</td><td>Product C</td><td>Diluent D</td><td></td>')
      $('input.nar').css('max-width','100px'); //change width of input cells
      $('#hide_molweight2,#hide_fluidvisc2,#hide_heatcapacity2,#hide_thermalcond2,#hide_molfrac2,#hide_res_gasdens2,#hide_difvol2,#hide_column_dvol2,#hide_column_vb2,#hide_molar_boil_vol2,#hide_liq_density2,#hide_wilke_assoc_phi2,#tbody_limitingreactant,#joback_2, #hide_gas_mole_fraction_2, #hide_liq_mole_fraction_2, #hide_henryconstant2, #hide_criticaltemperature2, #hide_criticalpressure2, #hide_vaporpressure2, #hide_vaporliquidflash_2').show('fast'); //show 2
      $('#hide_molweight4,#hide_fluidvisc4,#hide_heatcapacity4,#hide_thermalcond4,#hide_molfrac4,#hide_res_gasdens4,#hide_difvol4,#hide_column_dvol4,#hide_column_vb4,#hide_molar_boil_vol4,#hide_liq_density4,#hide_wilke_assoc_phi4,#joback_4, #hide_gas_mole_fraction_4, #hide_liq_mole_fraction_4, #hide_henryconstant4, #hide_criticaltemperature4, #hide_criticalpressure4, #hide_vaporpressure4, #hide_vaporliquidflash_4').hide('fast'); //hide 4
    } else if ($('#dr_num_reactants').val() == "One" && $('#dr_num_products').val() == "Two"){ //OPTION C -- hide 2, header reads A, B, C, D
      $('#tr_reactants_products_diluent_header').html('<td></td><td class="MainReact">Main<br>Reactant A</td><td>Product B</td><td>Product C</td><td>Diluent D</td><td></td>') //header reads A, B, C, D
      $('#tr_reactants_products_diluent_header_igdens').html('<td></td><td>Reactant A</td><td>Product B</td><td>Product C</td><td>Diluent D</td><td></td>') //header reads A, B, C, D
      $('#tr_reactants_products_diluent_header_fuller').html('<td></td><td>Reactant A</td><td>Product B</td><td>Product C</td><td>Diluent D</td><td></td>') //header reads A, B, C, D
      $('#tr_reactants_products_diluent_header_lebas').html('<td></td><td>Reactant A</td><td>Product B</td><td>Product C</td><td>Diluent D</td><td></td>') //header reads A, B, C, D
      $('#tr_reactants_products_diluent_header_joback').html('<td></td><td>Reactant A</td><td>Product B</td><td>Product C</td><td>Diluent D</td><td></td>')
      $('input.nar').css('max-width','100px'); //change width of input cells
      $('#hide_molweight2,#hide_fluidvisc2,#hide_heatcapacity2,#hide_thermalcond2,#hide_molfrac2,#hide_res_gasdens2,#hide_difvol2,#hide_column_dvol2,#hide_column_vb2,#hide_molar_boil_vol2,#hide_liq_density2,#hide_wilke_assoc_phi2,#tbody_limitingreactant,#joback_2, #hide_gas_mole_fraction_2, #hide_liq_mole_fraction_2, #hide_henryconstant2, #hide_criticaltemperature2, #hide_criticalpressure2, #hide_vaporpressure2, #hide_vaporliquidflash_2').hide('fast'); //hide 2
      $('#hide_molweight4,#hide_fluidvisc4,#hide_heatcapacity4,#hide_thermalcond4,#hide_molfrac4,#hide_res_gasdens4,#hide_difvol4,#hide_column_dvol4,#hide_column_vb4,#hide_molar_boil_vol4,#hide_liq_density4,#hide_wilke_assoc_phi4,#joback_4, #hide_gas_mole_fraction_4, #hide_liq_mole_fraction_4, #hide_henryconstant4, #hide_criticaltemperature4, #hide_criticalpressure4, #hide_vaporpressure4, #hide_vaporliquidflash_4').show('fast'); //show 4
    } else if ($('#dr_num_reactants').val() == "Two" && $('#dr_num_products').val() == "Two"){ //OPTION D -- hide NONE, header reads A, B, C, D, E
      $('#tr_reactants_products_diluent_header').html('<td></td><td class="MainReact">Main<br>Reactant A</td><td>Reactant B</td><td>Product C</td><td>Product D</td><td>Diluent E</td><td></td>') //header reads A, B, C, D, E
      $('#tr_reactants_products_diluent_header_igdens').html('<td></td><td>Reactant A</td><td>Reactant B</td><td>Product C</td><td>Product D</td><td>Diluent E</td><td></td>') //header reads A, B, C, D, E
      $('#tr_reactants_products_diluent_header_fuller').html('<td></td><td>Reactant A</td><td>Reactant B</td><td>Product C</td><td>Product D</td><td>Diluent E</td><td></td>') //header reads A, B, C, D, E
      $('#tr_reactants_products_diluent_header_lebas').html('<td></td><td>Reactant A</td><td>Reactant B</td><td>Product C</td><td>Product D</td><td>Diluent E</td><td></td>') //header reads A, B, C, D, E
      $('#tr_reactants_products_diluent_header_joback').html('<td></td><td>Reactant A</td><td>Reactant B</td><td>Product C</td><td>Product D</td><td>Diluent E</td><td></td>')
      $('input.nar').css('max-width','90px'); //change width of input cells
      //show BOTH 2 and 4
      $('#hide_molweight2,#hide_molweight4,#hide_fluidvisc2,#hide_fluidvisc4,#hide_heatcapacity2,#hide_heatcapacity4,#hide_thermalcond2,#hide_thermalcond4,#hide_molfrac2,#hide_molfrac4,#hide_res_gasdens2,#hide_res_gasdens4,#hide_difvol2,#hide_difvol4,#hide_column_dvol2,#hide_column_dvol4,#hide_column_vb2,#hide_column_vb4,#hide_molar_boil_vol2,#hide_molar_boil_vol4,#hide_liq_density2,#hide_liq_density4,#hide_wilke_assoc_phi2,#hide_wilke_assoc_phi4,#tbody_limitingreactant,#joback_2,#joback_4, #hide_gas_mole_fraction_2, #hide_gas_mole_fraction_4, #hide_liq_mole_fraction_2, #hide_liq_mole_fraction_4, #hide_henryconstant2, #hide_henryconstant4, #hide_criticaltemperature2 , #hide_criticaltemperature4, #hide_criticalpressure2, #hide_criticalpressure4, #hide_vaporpressure2, #hide_vaporpressure4, #hide_vaporliquidflash_2, #hide_vaporliquidflash_4').show('fast');
    }

  });
});

/*
//////////Trickle phase selection/////

$(document).ready(function(){
  $('#chosen_phase_1').on('keyup keydown change click', function(){
     if ($('#chosen_phase_1').val() == "Gas"){
      $('#common_used_gas_type_1,#boiling_point_1').show('fast'); //show 2
      $('#inorganic_acid_type_1, #baroncini_family_type_1,#joback_nr,#joback_r,#joback_halo,#joback_oxy,#joback_nitro,#joback_sulphur').hide('fast'); //hide 4
    } else if ($('#chosen_phase_1').val() == "Liquid"){ //OPTION B -- hide 4, header reads A, B, C, D
      $('#inorganic_acid_type_1, #baroncini_family_type_1, #boiling_point_1').show('fast'); //show 2
      $('#common_used_gas_type_1, #joback_nr,#joback_r,#joback_halo,#joback_oxy,#joback_nitro,#joback_sulphur').hide('fast'); //hide 4
    }
  });
});
$(document).ready(function(){
  $('#chosen_phase_2').on('keyup keydown change click', function(){
     if ($('#chosen_phase_2').val() == "Gas"){
      $('#common_used_gas_type_2,#boiling_point_2').show('fast'); //show 2
      $('#inorganic_acid_type_2, #baroncini_family_type_2,#joback_nr,#joback_r,#joback_halo,#joback_oxy,#joback_nitro,#joback_sulphur').hide('fast'); //hide 4
    } else if ($('#chosen_phase_2').val() == "Liquid"){ //OPTION B -- hide 4, header reads A, B, C, D
      $('#inorganic_acid_type_2, #baroncini_family_type_2, #boiling_point_2').show('fast'); //show 2
      $('#common_used_gas_type_2, #joback_nr,#joback_r,#joback_halo,#joback_oxy,#joback_nitro,#joback_sulphur').hide('fast'); //hide 4
    }
  });
});
$(document).ready(function(){
  $('#chosen_phase_3').on('keyup keydown change click', function(){
     if ($('#chosen_phase_3').val() == "Gas"){
      $('#common_used_gas_type_3,#boiling_point_3').show('fast'); //show 2
      $('#inorganic_acid_type_3, #baroncini_family_type_3,#joback_nr,#joback_r,#joback_halo,#joback_oxy,#joback_nitro,#joback_sulphur').hide('fast'); //hide 4
    } else if ($('#chosen_phase_3').val() == "Liquid"){ //OPTION B -- hide 4, header reads A, B, C, D
      $('#inorganic_acid_type_3, #baroncini_family_type_3, #boiling_point_3').show('fast'); //show 2
      $('#common_used_gas_type_3, #joback_nr,#joback_r,#joback_halo,#joback_oxy,#joback_nitro,#joback_sulphur').hide('fast'); //hide 4
    }
  });
});
$(document).ready(function(){
  $('#chosen_phase_4').on('keyup keydown change click', function(){
     if ($('#chosen_phase_4').val() == "Gas"){
      $('#common_used_gas_type_4,#boiling_point_4').show('fast'); //show 2
      $('#inorganic_acid_type_4, #baroncini_family_type_4,#joback_nr,#joback_r,#joback_halo,#joback_oxy,#joback_nitro,#joback_sulphur').hide('fast'); //hide 4
    } else if ($('#chosen_phase_4').val() == "Liquid"){ //OPTION B -- hide 4, header reads A, B, C, D
      $('#inorganic_acid_type_4, #baroncini_family_type_4, #boiling_point_4').show('fast'); //show 2
      $('#common_used_gas_type_4, #joback_nr,#joback_r,#joback_halo,#joback_oxy,#joback_nitro,#joback_sulphur').hide('fast'); //hide 4
    }
  });
});
$(document).ready(function(){
  $('#chosen_phase_5').on('keyup keydown change click', function(){
     if ($('#chosen_phase_5').val() == "Gas"){
      $('#common_used_gas_type_5,#boiling_point_5').show('fast'); //show 2
      $('#inorganic_acid_type_5, #baroncini_family_type_5,#joback_nr,#joback_r,#joback_halo,#joback_oxy,#joback_nitro,#joback_sulphur').hide('fast'); //hide 4
    } else if ($('#chosen_phase_5').val() == "Liquid"){ //OPTION B -- hide 4, header reads A, B, C, D
      $('#inorganic_acid_type_5, #baroncini_family_type_5, #boiling_point_5').show('fast'); //show 2
      $('#common_used_gas_type_5,#joback_nr,#joback_r,#joback_halo,#joback_oxy,#joback_nitro,#joback_sulphur').hide('fast'); //hide 4
    }
  });
});
*/

////////////////////////////////////////////////////////////////////////////
//function for hiding/showing liquid vs. gas relevant cells
$(document).ready(function(){
  $('#dr_reaction_phase,#populate_inputs').on('change click', function(){
    if ($('#dr_reaction_phase').val() == "Gas Phase"){
      $('#tbody_gas_dvol').show('fast');
      $('#tbody_liquid_vb').hide('fast');
      $('#tbody_ideal_gas_dens').show('fast');
      $('#tbody_gas_prandtl_test').show('fast');
      $('#common_used_gas').show('fast');
      $('#baroncini_family').hide('fast');
      $('#inorganic_acid').hide('fast');
      $('#gas_and_liquid').show('fast');
      //$('#trickle_bed1').hide('fast');
      //$('#trickle_bed2').hide('fast');
      $('#tbody_mole_fraction').hide('fast');
      $('#phase_selection').hide('fast');
      //$('#hide_trickle_bed').hide('fast');
      //$('#tbody_trickle_bed').hide('fast');
      //$('#tricklebedmixture1').hide('fast');
      //$('#tricklebedmixture2').hide('fast');
      $('#tr_reactants_products_diluent_header_igdens').show('fast');
      $('#purecomponentavg').show('fast');
      $('#purecomponentnumbers').show('fast');
      //$('#tricklebednote').hide('fast');
    } else if ($('#dr_reaction_phase').val() == "Liquid Phase"){
      $('#tbody_gas_dvol').hide('fast');
      $('#tbody_liquid_vb').show('fast');
      $('#tbody_ideal_gas_dens').hide('fast');
      $('#tbody_gas_prandtl_test').hide('fast');
      $('#common_used_gas').hide('fast');
      $('#baroncini_family').show('fast');
      $('#inorganic_acid').show('fast');
      $('#gas_and_liquid').show('fast');
      //$('#trickle_bed1').hide('fast');
      //$('#trickle_bed2').hide('fast');
      $('#tbody_mole_fraction').hide('fast');
      $('#phase_selection').hide('fast');
      $('#hide_trickle_bed').hide('fast');
      $('#tbody_trickle_bed').hide('fast');
      //$('#tricklebedmixture1').hide('fast');
      //$('#tricklebedmixture2').hide('fast');
      $('#tr_reactants_products_diluent_header_igdens').hide('fast');
      $('#purecomponentavg').show('fast');
      $('#purecomponentnumbers').show('fast');
      //$('#tricklebednote').hide('fast');
    /*}else if ($('#dr_reaction_phase').val() == "Trickle Bed(Gas-Liquid)"){
      $('#tbody_gas_dvol').show('fast');
      $('#tbody_liquid_vb').show('fast');
      $('#tbody_ideal_gas_dens').hide('fast');
      $('#tbody_gas_prandtl_test').hide('fast');
      $('#common_used_gas').show('fast');
      $('#baroncini_family').show('fast');
      $('#inorganic_acid').show('fast');
      $('#gas_and_liquid').hide('fast');
      $('#trickle_bed1').show('fast');
      $('#trickle_bed2').show('fast');
      $('#tbody_mole_fraction').show('fast');
      $('#phase_selection').show('fast');
      $('#hide_trickle_bed').show('fast');
      $('#tbody_trickle_bed').show('fast');
      $('#tricklebedmixture1').show('fast');
      $('#tricklebedmixture2').show('fast');
      $('#tr_reactants_products_diluent_header_igdens').show('fast');
      $('#purecomponentavg').hide('fast');
      $('#purecomponentnumbers').hide('fast');
      $('#tricklebednote').show('fast');
    */
    }
  });
});

////////////////////////////////////////////////////////////////////////////
//function for hiding/showing the advanced options section & setting checkbox=unchecked by default
$(document).ready(function(){
  $('#ck_override_diffusivity').prop('checked', false); //set checkbox to unchecked by default when the document loads

  $('#hide_advanced_input').on('click', function(){
    if ($('#ck_override_diffusivity').is(':checked') == true){ //if override is checked do NOT allow the section to be hidden!!

      if ($('#tbody_advanced_input').is(':visible') == true) {
        //do nothing
      } else {
        $('#tbody_advanced_input').show();
      }
    } else if ($('#ck_override_diffusivity').is(':checked') == false){ //if override is UNchecked then it is OK to allow the section to be hidden
      if ($('#tbody_advanced_input').is(':hidden') == false) {
        $('#tbody_advanced_input').toggle('fast');
      } else {
        $('#tbody_advanced_input').toggle('fast');
      }
    }
  });
});///need to test this


////////////////////////////////////////////////////////////////////////////
//manually set name to be the same as id for inputs/textarea/select
$(document).ready(function(){
    var $inputs = $('form.insec').find('input'); //get inputs in form
    var $inputs2 = $('form.insec2').find('input'); //get inputs in second part of form
    var $textarea = $('form.insec').find('textarea'); //get textareas in form
    var $dropdowns = $('form.insec').find('select'); //get dropdown/select in form

    ///////////////////////////////////////
    //NOTE: VERY IMPORTANT!, if one wants to save inputs to the JSON file
    //the name attribute MUST be set for anything to be captured by the
    //later command 'serializeArray', the following code in this block is
    //a hack to set the name to the id tag
    ///////////////////////////////////////

    $inputs.each(function (){ //set the name to id for inputs
      this.name = this.id;
    });
    $inputs2.each(function (){
      this.name = this.id;
    });
    $textarea.each(function (){
      this.name = this.id;
    });
    $dropdowns.each(function (){
      this.name = this.id;
    });
});

////////////////////////////////////////////////////////////////////////////
//function for saving current input values to a JSON file for later use
$(document).ready(function(){
  $("#save_inputs_section_as_JSON").on('click', function (){
    var str = $('form.insec').serializeArray(); //find inputs within class=insec form
    var str2 = $('form.insec2').serializeArrayWithCheckboxes(); //find inputs within class=insec2 form INCLUDING CHECKBOXES w/ custom function
    var strCombined = str.concat(str2); //append insec2 to insec serialized form
    var strjson = JSON.stringify(strCombined, null, '\t'); //convert to string JSON format for saving

    var filename = $("#JSON_filename").val(); //get user input for filename, defaulted to 'catalysis'
    var suffix = ".json"; //add json suffix
    var output = document.querySelector('a#save_inputs_section_as_JSON'); //NOT compatible with IE11

    output.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(strjson);
    output.download = filename + suffix;
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////// Begin section for actually inputting and calculating things  ////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////


//define scope object that will be used to store unrounded values
var catscope = {};

$(document).ready(function(){
  $(document).ready(function(){
    $(".initialize").trigger("change");
  });

  //////////////////////////////////////////////////////////////////////////////////
  // Function to add all of the inputs section into the "catscope" object for later use
  $("#temp,.initialize,#button_fuller_dvol_calculate").on('keyup keydown change click', function (){
    //inputs
    var dr_reaction_phase = $("#dr_reaction_phase").val();
    var temp = $("#temp").val().toNum(); //kelvin
    var pressure = $("#pressure").val().toNum();//bar
    var R_rctr = $("#R_rctr").val().toNum();
    var L_bed = $("#L_bed").val().toNum();
    var R_p = $("#R_p").val().toNum();
    var R_p_inner = $("#R_p_inner").val().toNum();
    var L_p = $("#L_p").val().toNum();
    var rxn_rate = $("#rxn_rate").val().toNum();
    var rxn_enthalpy = $("#rxn_enthalpy").val().toNum();
    var dr_rxn_order = $("#dr_rxn_order").val().toNum(); //toNum for reaction order
    var rxn_activation_energy = $("#rxn_activation_energy").val().toNum();
    var rxn_conversion1 = $("#rxn_conversion1").val().toNum();
    var cat_rho_bulk = $("#cat_rho_bulk").val().toNum();
    var cat_void_frac = $("#cat_void_frac").val().toNum();
    var cat_thermal_cond = $("#cat_thermal_cond").val().toNum();
    var cat_surf_area = $("#cat_surf_area").val().toNum();
    var cat_pore_volume = $("#cat_pore_volume").val().toNum();
    var cat_pore_tortuosity = $("#cat_pore_tortuosity").val().toNum();
    var dr_cat_shape = $("#dr_cat_shape").val();
    var molfrac1 = $("#molfrac1").val().toNum();
    var molfrac2 = $("#molfrac2").val().toNum();
    var molfrac3 = $("#molfrac3").val().toNum();
    var molfrac4 = $("#molfrac4").val().toNum();
    var molfrac5 = $("#molfrac5").val().toNum();
    var fluidvisc1 = $("#fluidvisc1").val().toNum();
    var fluidvisc2 = $("#fluidvisc2").val().toNum();
    var fluidvisc3 = $("#fluidvisc3").val().toNum();
    var fluidvisc4 = $("#fluidvisc4").val().toNum();
    var fluidvisc5 = $("#fluidvisc5").val().toNum();
    var heatcapacity1 = $("#heatcapacity1").val().toNum();
    var heatcapacity2 = $("#heatcapacity2").val().toNum();
    var heatcapacity3 = $("#heatcapacity3").val().toNum();
    var heatcapacity4 = $("#heatcapacity4").val().toNum();
    var heatcapacity5 = $("#heatcapacity5").val().toNum();
    var thermalcond1 = $("#thermalcond1").val().toNum();
    var thermalcond2 = $("#thermalcond2").val().toNum();
    var thermalcond3 = $("#thermalcond3").val().toNum();
    var thermalcond4 = $("#thermalcond4").val().toNum();
    var thermalcond5 = $("#thermalcond5").val().toNum();
    var molweight1 = $("#molweight1").val().toNum();
    var molweight2 = $("#molweight2").val().toNum();
    var molweight3 = $("#molweight3").val().toNum();
    var molweight4 = $("#molweight4").val().toNum();
    var molweight5 = $("#molweight5").val().toNum();
/*
    var chosen_phase_1 = $("#chosen_phase_1").val().toNum();
    var chosen_phase_2 = $("#chosen_phase_2").val().toNum();
    var chosen_phase_3 = $("#chosen_phase_3").val().toNum();
    var chosen_phase_4 = $("#chosen_phase_4").val().toNum();
    var chosen_phase_5 = $("#chosen_phase_5").val().toNum();
*/
    //GAS specific
    var difvol1 = $("#difvol1").val().toNum();
    var difvol2 = $("#difvol2").val().toNum();
    var difvol3 = $("#difvol3").val().toNum();
    var difvol4 = $("#difvol4").val().toNum();
    var difvol5 = $("#difvol5").val().toNum();

    //LIQUID specific
    var liq_density1 = $("#liq_density1").val().toNum();
    var liq_density2 = $("#liq_density2").val().toNum();
    var liq_density3 = $("#liq_density3").val().toNum();
    var liq_density4 = $("#liq_density4").val().toNum();
    var liq_density5 = $("#liq_density5").val().toNum();
    var molar_boil_vol1 = $("#molar_boil_vol1").val().toNum();
    var molar_boil_vol2 = $("#molar_boil_vol2").val().toNum();
    var molar_boil_vol3 = $("#molar_boil_vol3").val().toNum();
    var molar_boil_vol4 = $("#molar_boil_vol4").val().toNum();
    var molar_boil_vol5 = $("#molar_boil_vol5").val().toNum();
    var wilke_assoc_phi2 = $("#wilke_assoc_phi2").val().toNum();
    var wilke_assoc_phi3 = $("#wilke_assoc_phi3").val().toNum();
    var wilke_assoc_phi4 = $("#wilke_assoc_phi4").val().toNum();
    var wilke_assoc_phi5 = $("#wilke_assoc_phi5").val().toNum();

    //effective diffusivity checkbox & override value
    var ck_override_diffusivity = $("#ck_override_diffusivity").is(':checked');
    var diff_effective_override = $("#diff_effective_override").val().toNum();

    //look for lack of entries and replace with zero if empty
    if ($('#molfrac1').val().length == 0){molfrac1 = 0;} //if there is no molfrac entry assume it is zero
    if ($('#molfrac2').val().length == 0){molfrac2 = 0;}
    if ($('#molfrac3').val().length == 0){molfrac3 = 0;}
    if ($('#molfrac4').val().length == 0){molfrac4 = 0;}
    if ($('#molfrac5').val().length == 0){molfrac5 = 0;}
    if ($('#fluidvisc1').val().length == 0){fluidvisc1 = 0;}
    if ($('#fluidvisc2').val().length == 0){fluidvisc2 = 0;}
    if ($('#fluidvisc3').val().length == 0){fluidvisc3 = 0;}
    if ($('#fluidvisc4').val().length == 0){fluidvisc4 = 0;}
    if ($('#fluidvisc5').val().length == 0){fluidvisc5 = 0;}
    if ($('#heatcapacity1').val().length == 0){heatcapacity1 = 0;}
    if ($('#heatcapacity2').val().length == 0){heatcapacity2 = 0;}
    if ($('#heatcapacity3').val().length == 0){heatcapacity3 = 0;}
    if ($('#heatcapacity4').val().length == 0){heatcapacity4 = 0;}
    if ($('#heatcapacity5').val().length == 0){heatcapacity5 = 0;}
    if ($('#thermalcond1').val().length == 0){thermalcond1 = 0;}
    if ($('#thermalcond2').val().length == 0){thermalcond2 = 0;}
    if ($('#thermalcond3').val().length == 0){thermalcond3 = 0;}
    if ($('#thermalcond4').val().length == 0){thermalcond4 = 0;}
    if ($('#thermalcond5').val().length == 0){thermalcond5 = 0;}
    if ($('#molweight1').val().length == 0){molweight1 = 0;} //if there is no molweight entry assume it is zero
    if ($('#molweight2').val().length == 0){molweight2 = 0;}
    if ($('#molweight3').val().length == 0){molweight3 = 0;}
    if ($('#molweight4').val().length == 0){molweight4 = 0;}
    if ($('#molweight5').val().length == 0){molweight5 = 0;}

    //add variables to the catscope
    catscope.dr_reaction_phase = dr_reaction_phase;
    catscope.temp = temp;
    catscope.pressure = pressure;
    catscope.R_rctr = R_rctr;
    catscope.L_bed = L_bed;
    catscope.R_p = R_p; //particle length
    catscope.R_p_inner = R_p_inner; //inner particle radius (for rings)
    catscope.L_p = L_p; //particle length for rings and cylinders
    catscope.rxn_rate = rxn_rate;
    catscope.rxn_enthalpy = rxn_enthalpy;
    catscope.dr_rxn_order = dr_rxn_order;
    catscope.rxn_activation_energy = rxn_activation_energy;
    catscope.rxn_conversion1 = rxn_conversion1;
    catscope.cat_rho_bulk = cat_rho_bulk;
    catscope.cat_void_frac = cat_void_frac;
    catscope.cat_thermal_cond = cat_thermal_cond;
    catscope.cat_surf_area = cat_surf_area;
    catscope.cat_pore_volume = cat_pore_volume;
    catscope.cat_pore_tortuosity = cat_pore_tortuosity;
    catscope.dr_cat_shape = dr_cat_shape;
/*
    catscope.chosen_phase_1=chosen_phase_1;
    catscope.chosen_phase_2=chosen_phase_2;
    catscope.chosen_phase_3=chosen_phase_3;
    catscope.chosen_phase_4=chosen_phase_4;
    catscope.chosen_phase_5=chosen_phase_5;
*/
    catscope.molfrac1 = molfrac1;
    catscope.molfrac2 = molfrac2;
    catscope.molfrac3 = molfrac3;
    catscope.molfrac4 = molfrac4;
    catscope.molfrac5 = molfrac5;
    catscope.fluidvisc1 = fluidvisc1;
    catscope.fluidvisc2 = fluidvisc2;
    catscope.fluidvisc3 = fluidvisc3;
    catscope.fluidvisc4 = fluidvisc4;
    catscope.fluidvisc5 = fluidvisc5;
    catscope.heatcapacity1 = heatcapacity1;
    catscope.heatcapacity2 = heatcapacity2;
    catscope.heatcapacity3 = heatcapacity3;
    catscope.heatcapacity4 = heatcapacity4;
    catscope.heatcapacity5 = heatcapacity5;
    catscope.thermalcond1 = thermalcond1;
    catscope.thermalcond2 = thermalcond2;
    catscope.thermalcond3 = thermalcond3;
    catscope.thermalcond4 = thermalcond4;
    catscope.thermalcond5 = thermalcond5;
    catscope.molweight1 = molweight1;
    catscope.molweight2 = molweight2;
    catscope.molweight3 = molweight3;
    catscope.molweight4 = molweight4;
    catscope.molweight5 = molweight5;

    //GAS specific
    catscope.difvol1 = difvol1;
    catscope.difvol2 = difvol2;
    catscope.difvol3 = difvol3;
    catscope.difvol4 = difvol4;
    catscope.difvol5 = difvol5;

    //LIQUID specific
    catscope.liq_density1 = liq_density1;
    catscope.liq_density2 = liq_density2;
    catscope.liq_density3 = liq_density3;
    catscope.liq_density4 = liq_density4;
    catscope.liq_density5 = liq_density5;
    catscope.molar_boil_vol1 = molar_boil_vol1;
    catscope.molar_boil_vol2 = molar_boil_vol2;
    catscope.molar_boil_vol3 = molar_boil_vol3;
    catscope.molar_boil_vol4 = molar_boil_vol4;
    catscope.molar_boil_vol5 = molar_boil_vol5;
    catscope.wilke_assoc_phi2 = wilke_assoc_phi2; //no value for A=1
    catscope.wilke_assoc_phi3 = wilke_assoc_phi3;
    catscope.wilke_assoc_phi4 = wilke_assoc_phi4;
    catscope.wilke_assoc_phi5 = wilke_assoc_phi5;

    //effective diffusivity checkbox & override value
    catscope.ck_override_diffusivity = ck_override_diffusivity; //checkbox for override diffusivity
    catscope.diff_effective_override = diff_effective_override; //actual value to be used later as effective diffusivity via user input

    //do some conversion to SI for non-SI inputs
    catscope.cat_pore_volume_SI = math.eval('cat_pore_volume*1000',catscope);

    //predefine some catscope arrays
    catscope.molWeightArray = [catscope.molweight1, catscope.molweight2, catscope.molweight3, catscope.molweight4, catscope.molweight5]; //g per mol
    catscope.molFracArray = [catscope.molfrac1, catscope.molfrac2, catscope.molfrac3, catscope.molfrac4, catscope.molfrac5];
    catscope.diffusion_volume_Array = [catscope.difvol1,catscope.difvol2,catscope.difvol3,catscope.difvol4,catscope.difvol5];
    catscope.liqDensityArray = [catscope.liq_density1,catscope.liq_density2,catscope.liq_density3,catscope.liq_density4,catscope.liq_density5]; //kg per m^3
  });

  //////////////////////////////////////////////////////////////////////////////////
  // Function to add all of the outputs section into the "catscope" object for later use
  $(".initialize,#temp").on('keyup keydown change', function (){
    catscope.res_gasdens1 = 0;
    catscope.res_gasdens2 = 0;
    catscope.res_gasdens3 = 0;
    catscope.res_gasdens4 = 0;
    catscope.res_gasdens5 = 0;
    catscope.res_bulkconc1 = 0;
    catscope.limiting_reactant_check = 0;
    catscope.rxn_avg_bulk_concentration1 = 0;//not an output
    catscope.mass_flowrate = 0;
    catscope.molar_flowrate1 = 0; //not an output
    catscope.volumetric_flowrate = 0; //not an output
    catscope.mass_catalyst = 0;
    catscope.bed_volume = 0;
    catscope.cat_porosity = 0;
    catscope.cat_rho_particle = 0;
    catscope.cat_pore_radius = 0;
    catscope.cat_particle_vol = 0;
    catscope.cat_ext_area = 0;
    catscope.cat_interfacial_area = 0;
    catscope.avg_mw = 0;
    catscope.avg_cp = 0;
    catscope.avg_k_conduct = 0;
    catscope.avg_viscosity = 0;
    catscope.avg_density = 0;
    catscope.diff_mixture = 0;
    catscope.superf_mass_flux = 0;
    catscope.ndim_reynolds = 0;
    catscope.ndim_prandtl = 0;
    catscope.ndim_schmidt = 0;
    catscope.ndim_colburn = 0;
    catscope.ndim_massXfer_coeff = 0;
    catscope.ndim_sherwood = 0;
    catscope.ndim_heatXfer_coeff = 0;
    catscope.ndim_nusselt = 0;
    catscope.diff_knudsen = 0;
    catscope.diff_effective = 0;
    catscope.rxn_weisz_prater = 0;
    catscope.rxn_weisz_prater_inlet = 0;
    catscope.rxn_weisz_prater_outlet = 0;
    catscope.rxn_thiele = 0;
    catscope.rxn_thiele_inlet = 0;
    catscope.rxn_thiele_outlet = 0;
    catscope.rxn_eff_factor = 0;
    catscope.rxn_eff_factor_inlet = 0;
    catscope.rxn_eff_factor_outlet = 0;
    catscope.rxn_externalconc_grad = 0;
    catscope.rxn_externaltemp_grad = 0;
    catscope.rxn_internaltemp_grad = 0;
    catscope.ndim_prater = 0;
    catscope.rxn_intrinsic_rconst = 0;
    catscope.rxn_maxlimitingrate = 0;
    catscope.rxn_surfconcentration = 0;
    catscope.rxn_surftemperature = 0;
    catscope.axial_disp_coeff = 0;
    catscope.ndim_peclet = 0;
    catscope.ndim_bodenstein = 0;
    catscope.bed_pressure_drop = 0;
    catscope.ndim_BL_thickness = 0;
    catscope.cat_effective_radius_volequiv = 0; //not an output
    catscope.cat_effective_radius_ergun = 0; //not an output
    catscope.cat_effective_radius = 0; //not an output
    catscope.ndim_biot_solid = 0;//not an output
  });

  //////////////////////////////////////////////////////////////////////////////////
  // Function to get the inputs to the Fuller method popup into catscope
  $(".initialize,#temp,#pressure").on('keyup keydown change click', function (){
    var fuller_C1 = $("#fuller_C1").val().toNum();
    var fuller_H1 = $("#fuller_H1").val().toNum();
    var fuller_O1 = $("#fuller_O1").val().toNum();
    var fuller_N1 = $("#fuller_N1").val().toNum();
    var fuller_S1 = $("#fuller_S1").val().toNum();
    var fuller_F1 = $("#fuller_F1").val().toNum();
    var fuller_Cl1 = $("#fuller_Cl1").val().toNum();
    var fuller_Br1 = $("#fuller_Br1").val().toNum();
    var fuller_I1 = $("#fuller_I1").val().toNum();
    var fuller_ar1 = $("#fuller_ar1").val().toNum();
    var fuller_het1 = $("#fuller_het1").val().toNum();

    var fuller_C2 = $("#fuller_C2").val().toNum();
    var fuller_H2 = $("#fuller_H2").val().toNum();
    var fuller_O2 = $("#fuller_O2").val().toNum();
    var fuller_N2 = $("#fuller_N2").val().toNum();
    var fuller_S2 = $("#fuller_S2").val().toNum();
    var fuller_F2 = $("#fuller_F2").val().toNum();
    var fuller_Cl2 = $("#fuller_Cl2").val().toNum();
    var fuller_Br2 = $("#fuller_Br2").val().toNum();
    var fuller_I2 = $("#fuller_I2").val().toNum();
    var fuller_ar2 = $("#fuller_ar2").val().toNum();
    var fuller_het2 = $("#fuller_het2").val().toNum();

    var fuller_C3 = $("#fuller_C3").val().toNum();
    var fuller_H3 = $("#fuller_H3").val().toNum();
    var fuller_O3 = $("#fuller_O3").val().toNum();
    var fuller_N3 = $("#fuller_N3").val().toNum();
    var fuller_S3 = $("#fuller_S3").val().toNum();
    var fuller_F3 = $("#fuller_F3").val().toNum();
    var fuller_Cl3 = $("#fuller_Cl3").val().toNum();
    var fuller_Br3 = $("#fuller_Br3").val().toNum();
    var fuller_I3 = $("#fuller_I3").val().toNum();
    var fuller_ar3 = $("#fuller_ar3").val().toNum();
    var fuller_het3 = $("#fuller_het3").val().toNum();

    var fuller_C4 = $("#fuller_C4").val().toNum();
    var fuller_H4 = $("#fuller_H4").val().toNum();
    var fuller_O4 = $("#fuller_O4").val().toNum();
    var fuller_N4 = $("#fuller_N4").val().toNum();
    var fuller_S4 = $("#fuller_S4").val().toNum();
    var fuller_F4 = $("#fuller_F4").val().toNum();
    var fuller_Cl4 = $("#fuller_Cl4").val().toNum();
    var fuller_Br4 = $("#fuller_Br4").val().toNum();
    var fuller_I4 = $("#fuller_I4").val().toNum();
    var fuller_ar4 = $("#fuller_ar4").val().toNum();
    var fuller_het4 = $("#fuller_het4").val().toNum();

    var fuller_C5 = $("#fuller_C5").val().toNum();
    var fuller_H5 = $("#fuller_H5").val().toNum();
    var fuller_O5 = $("#fuller_O5").val().toNum();
    var fuller_N5 = $("#fuller_N5").val().toNum();
    var fuller_S5 = $("#fuller_S5").val().toNum();
    var fuller_F5 = $("#fuller_F5").val().toNum();
    var fuller_Cl5 = $("#fuller_Cl5").val().toNum();
    var fuller_Br5 = $("#fuller_Br5").val().toNum();
    var fuller_I5 = $("#fuller_I5").val().toNum();
    var fuller_ar5 = $("#fuller_ar5").val().toNum();
    var fuller_het5 = $("#fuller_het5").val().toNum();

    var dr_molname_dvol1 = $("#dr_molname_dvol1 option:selected").attr("name");
    var dr_molname_dvol2 = $("#dr_molname_dvol2 option:selected").attr("name");
    var dr_molname_dvol3 = $("#dr_molname_dvol3 option:selected").attr("name");
    var dr_molname_dvol4 = $("#dr_molname_dvol4 option:selected").attr("name");
    var dr_molname_dvol5 = $("#dr_molname_dvol5 option:selected").attr("name");

    var fuller_Array1 = [fuller_C1,fuller_H1,fuller_O1,fuller_N1,fuller_S1,fuller_F1,fuller_Cl1,fuller_Br1,fuller_I1,fuller_ar1,fuller_het1];
    var fuller_Array2 = [fuller_C2,fuller_H2,fuller_O2,fuller_N2,fuller_S2,fuller_F2,fuller_Cl2,fuller_Br2,fuller_I2,fuller_ar2,fuller_het2];
    var fuller_Array3 = [fuller_C3,fuller_H3,fuller_O3,fuller_N3,fuller_S3,fuller_F3,fuller_Cl3,fuller_Br3,fuller_I3,fuller_ar3,fuller_het3];
    var fuller_Array4 = [fuller_C4,fuller_H4,fuller_O4,fuller_N4,fuller_S4,fuller_F4,fuller_Cl4,fuller_Br4,fuller_I4,fuller_ar4,fuller_het4];
    var fuller_Array5 = [fuller_C5,fuller_H5,fuller_O5,fuller_N5,fuller_S5,fuller_F5,fuller_Cl5,fuller_Br5,fuller_I5,fuller_ar5,fuller_het5];

    var dr_molname_Array = [dr_molname_dvol1,dr_molname_dvol2,dr_molname_dvol3,dr_molname_dvol4,dr_molname_dvol5];

    fuller_Array1 = replaceNaN(fuller_Array1);
    fuller_Array2 = replaceNaN(fuller_Array2);
    fuller_Array3 = replaceNaN(fuller_Array3);
    fuller_Array4 = replaceNaN(fuller_Array4);
    fuller_Array5 = replaceNaN(fuller_Array5);

    var fuller_Array1_mw = fuller_Array1.slice(0,-2);
    var fuller_Array2_mw = fuller_Array2.slice(0,-2);
    var fuller_Array3_mw = fuller_Array3.slice(0,-2);
    var fuller_Array4_mw = fuller_Array4.slice(0,-2);
    var fuller_Array5_mw = fuller_Array5.slice(0,-2);

    //add newly created arrays into the catscope object for later use
    catscope.fuller_Array1 = fuller_Array1;
    catscope.fuller_Array2 = fuller_Array2;
    catscope.fuller_Array3 = fuller_Array3;
    catscope.fuller_Array4 = fuller_Array4;
    catscope.fuller_Array5 = fuller_Array5;

    catscope.fuller_Array1_mw = fuller_Array1_mw;
    catscope.fuller_Array2_mw = fuller_Array2_mw;
    catscope.fuller_Array3_mw = fuller_Array3_mw;
    catscope.fuller_Array4_mw = fuller_Array4_mw;
    catscope.fuller_Array5_mw = fuller_Array5_mw;

    catscope.dr_molname_dvol1 = dr_molname_dvol1;
    catscope.dr_molname_dvol2 = dr_molname_dvol2;
    catscope.dr_molname_dvol3 = dr_molname_dvol3;
    catscope.dr_molname_dvol4 = dr_molname_dvol4;
    catscope.dr_molname_dvol5 = dr_molname_dvol5;

    catscope.dr_molname_Array = dr_molname_Array;
  });
    //////////////////////////////////////////////////////////////////////////////////
  // Function to get the inputs to the Joback method popup into catscope
  $(".initialize,#temp,#pressure").on('keyup keydown change click', function (){


    var boiling_point_1=$("#boiling_point_1").val().toNum();
    var boiling_point_2=$("#boiling_point_2").val().toNum();
    var boiling_point_3=$("#boiling_point_3").val().toNum();
    var boiling_point_4=$("#boiling_point_4").val().toNum();
    var boiling_point_5=$("#boiling_point_5").val().toNum();


    catscope.boiling_point_1=boiling_point_1;
    catscope.boiling_point_2=boiling_point_2;
    catscope.boiling_point_3=boiling_point_3;
    catscope.boiling_point_4=boiling_point_4;
    catscope.boiling_point_5=boiling_point_5;

    var boiling_point_array=[boiling_point_1,boiling_point_2,boiling_point_3,boiling_point_4,boiling_point_5];
    boiling_point_array=replaceNaN(boiling_point_array)
    catscope.boiling_point_array=boiling_point_array;

    //common used gas

    var common_used_gas_type_1=$("#common_used_gas_type_1").val();
    var common_used_gas_type_2=$("#common_used_gas_type_2").val();
    var common_used_gas_type_3=$("#common_used_gas_type_3").val();
    var common_used_gas_type_4=$("#common_used_gas_type_4").val();
    var common_used_gas_type_5=$("#common_used_gas_type_5").val();

    var common_used_gas_type_array=[common_used_gas_type_1,common_used_gas_type_2,common_used_gas_type_3,common_used_gas_type_4,common_used_gas_type_5];
    catscope.common_used_gas_type_array=common_used_gas_type_array;

    catscope.common_used_gas_type_1=common_used_gas_type_1;
    catscope.common_used_gas_type_2=common_used_gas_type_2;
    catscope.common_used_gas_type_3=common_used_gas_type_3;
    catscope.common_used_gas_type_4=common_used_gas_type_4;
    catscope.common_used_gas_type_5=common_used_gas_type_5;

//

    var baroncini_family_type_1=$("#baroncini_family_type_1").val();
    var baroncini_family_type_2=$("#baroncini_family_type_2").val();
    var baroncini_family_type_3=$("#baroncini_family_type_3").val();
    var baroncini_family_type_4=$("#baroncini_family_type_4").val();
    var baroncini_family_type_5=$("#baroncini_family_type_5").val();

    var baroncini_family_type_array=[baroncini_family_type_1,baroncini_family_type_2,baroncini_family_type_3,baroncini_family_type_4,baroncini_family_type_5];
    catscope.baroncini_family_type_array=baroncini_family_type_array;

    catscope.baroncini_family_type_1=baroncini_family_type_1;
    catscope.baroncini_family_type_2=baroncini_family_type_2;
    catscope.baroncini_family_type_3=baroncini_family_type_3;
    catscope.baroncini_family_type_4=baroncini_family_type_4;
    catscope.baroncini_family_type_5=baroncini_family_type_5;

//inorganic part liquid

    var inorganic_acid_type_1=$("#inorganic_acid_type_1").val();
    var inorganic_acid_type_2=$("#inorganic_acid_type_2").val();
    var inorganic_acid_type_3=$("#inorganic_acid_type_3").val();
    var inorganic_acid_type_4=$("#inorganic_acid_type_4").val();
    var inorganic_acid_type_5=$("#inorganic_acid_type_5").val();

    var inorganic_acid_type_array=[inorganic_acid_type_1,inorganic_acid_type_2,inorganic_acid_type_3,inorganic_acid_type_4,inorganic_acid_type_5];
    catscope.inorganic_acid_type_array=inorganic_acid_type_array;

    catscope.inorganic_acid_type_1=inorganic_acid_type_1;
    catscope.inorganic_acid_type_2=inorganic_acid_type_2;
    catscope.inorganic_acid_type_3=inorganic_acid_type_3;
    catscope.inorganic_acid_type_4=inorganic_acid_type_4;
    catscope.inorganic_acid_type_5=inorganic_acid_type_5;

//

    var joback_nr1_1=$("#joback_nr1_1").val().toNum();
    var joback_nr1_2=$("#joback_nr1_2").val().toNum();
    var joback_nr1_3=$("#joback_nr1_3").val().toNum();
    var joback_nr1_4=$("#joback_nr1_4").val().toNum();
    var joback_nr1_5=$("#joback_nr1_5").val().toNum();
    var joback_nr1_6=$("#joback_nr1_6").val().toNum();
    var joback_nr1_7=$("#joback_nr1_7").val().toNum();
    var joback_nr1_8=$("#joback_nr1_8").val().toNum();
    var joback_nr1_9=$("#joback_nr1_9").val().toNum();
    var joback_nr1_10=$("#joback_nr1_10").val().toNum();

    var joback_nr1=[joback_nr1_1, joback_nr1_2, joback_nr1_3, joback_nr1_4, joback_nr1_5, joback_nr1_6, joback_nr1_7, joback_nr1_8, joback_nr1_9, joback_nr1_10];
    joback_nr1=replaceNaN(joback_nr1);

    var joback_r1_1=$("#joback_r1_1").val().toNum();
    var joback_r1_2=$("#joback_r1_2").val().toNum();
    var joback_r1_3=$("#joback_r1_3").val().toNum();
    var joback_r1_4=$("#joback_r1_4").val().toNum();
    var joback_r1_5=$("#joback_r1_5").val().toNum();

    var joback_r1=[joback_r1_1, joback_r1_2, joback_r1_3, joback_r1_4, joback_r1_5];
    joback_r1=replaceNaN(joback_r1);

    var joback_halo1_1=$("#joback_halo1_1").val().toNum();
    var joback_halo1_2=$("#joback_halo1_2").val().toNum();
    var joback_halo1_3=$("#joback_halo1_3").val().toNum();
    var joback_halo1_4=$("#joback_halo1_4").val().toNum();

    var joback_halo1=[joback_halo1_1, joback_halo1_2, joback_halo1_3, joback_halo1_4];
    joback_halo1=replaceNaN(joback_halo1);

    var joback_oxy1_1=$("#joback_oxy1_1").val().toNum();
    var joback_oxy1_2=$("#joback_oxy1_2").val().toNum();
    var joback_oxy1_3=$("#joback_oxy1_3").val().toNum();
    var joback_oxy1_4=$("#joback_oxy1_4").val().toNum();
    var joback_oxy1_5=$("#joback_oxy1_5").val().toNum();
    var joback_oxy1_6=$("#joback_oxy1_6").val().toNum();
    var joback_oxy1_7=$("#joback_oxy1_7").val().toNum();
    var joback_oxy1_8=$("#joback_oxy1_8").val().toNum();
    var joback_oxy1_9=$("#joback_oxy1_9").val().toNum();
    var joback_oxy1_10=$("#joback_oxy1_10").val().toNum();

    var joback_oxy1=[joback_oxy1_1, joback_oxy1_2, joback_oxy1_3, joback_oxy1_4, joback_oxy1_5, joback_oxy1_6, joback_oxy1_7, joback_oxy1_8, joback_oxy1_9, joback_oxy1_10];
    joback_oxy1=replaceNaN(joback_oxy1);

    var joback_nitro1_1=$("#joback_nitro1_1").val().toNum();
    var joback_nitro1_2=$("#joback_nitro1_2").val().toNum();
    var joback_nitro1_3=$("#joback_nitro1_3").val().toNum();
    var joback_nitro1_4=$("#joback_nitro1_4").val().toNum();
    var joback_nitro1_5=$("#joback_nitro1_5").val().toNum();
    var joback_nitro1_6=$("#joback_nitro1_6").val().toNum();
    var joback_nitro1_7=$("#joback_nitro1_7").val().toNum();

    var joback_nitro1=[joback_nitro1_1, joback_nitro1_2, joback_nitro1_3, joback_nitro1_4, joback_nitro1_5, joback_nitro1_6, joback_nitro1_7];
     joback_nitro1=replaceNaN(joback_nitro1);

    var joback_sulphur1_1=$("#joback_sulphur1_1").val().toNum();
    var joback_sulphur1_2=$("#joback_sulphur1_2").val().toNum();
    var joback_sulphur1_3=$("#joback_sulphur1_3").val().toNum();

    var joback_sulphur1=[joback_sulphur1_1, joback_sulphur1_2, joback_sulphur1_3];
     joback_sulphur1=replaceNaN(joback_sulphur1);

    var joback_nr2_1=$("#joback_nr2_1").val().toNum();
    var joback_nr2_2=$("#joback_nr2_2").val().toNum();
    var joback_nr2_3=$("#joback_nr2_3").val().toNum();
    var joback_nr2_4=$("#joback_nr2_4").val().toNum();
    var joback_nr2_5=$("#joback_nr2_5").val().toNum();
    var joback_nr2_6=$("#joback_nr2_6").val().toNum();
    var joback_nr2_7=$("#joback_nr2_7").val().toNum();
    var joback_nr2_8=$("#joback_nr2_8").val().toNum();
    var joback_nr2_9=$("#joback_nr2_9").val().toNum();
    var joback_nr2_10=$("#joback_nr2_10").val().toNum();

    var joback_nr2=[joback_nr2_1, joback_nr2_2, joback_nr2_3, joback_nr2_4, joback_nr2_5, joback_nr2_6, joback_nr2_7, joback_nr2_8, joback_nr2_9, joback_nr2_10];

    var joback_r2_1=$("#joback_r2_1").val().toNum();
    var joback_r2_2=$("#joback_r2_2").val().toNum();
    var joback_r2_3=$("#joback_r2_3").val().toNum();
    var joback_r2_4=$("#joback_r2_4").val().toNum();
    var joback_r2_5=$("#joback_r2_5").val().toNum();

    var joback_r2=[joback_r2_1, joback_r2_2, joback_r2_3, joback_r2_4, joback_r2_5];

    var joback_halo2_1=$("#joback_halo2_1").val().toNum();
    var joback_halo2_2=$("#joback_halo2_2").val().toNum();
    var joback_halo2_3=$("#joback_halo2_3").val().toNum();
    var joback_halo2_4=$("#joback_halo2_4").val().toNum();

    var joback_halo2=[joback_halo2_1, joback_halo2_2, joback_halo2_3, joback_halo2_4];

    var joback_oxy2_1=$("#joback_oxy2_1").val().toNum();
    var joback_oxy2_2=$("#joback_oxy2_2").val().toNum();
    var joback_oxy2_3=$("#joback_oxy2_3").val().toNum();
    var joback_oxy2_4=$("#joback_oxy2_4").val().toNum();
    var joback_oxy2_5=$("#joback_oxy2_5").val().toNum();
    var joback_oxy2_6=$("#joback_oxy2_6").val().toNum();
    var joback_oxy2_7=$("#joback_oxy2_7").val().toNum();
    var joback_oxy2_8=$("#joback_oxy2_8").val().toNum();
    var joback_oxy2_9=$("#joback_oxy2_9").val().toNum();
    var joback_oxy2_10=$("#joback_oxy2_10").val().toNum();

    var joback_oxy2=[joback_oxy2_1, joback_oxy2_2, joback_oxy2_3, joback_oxy2_4, joback_oxy2_5, joback_oxy2_6, joback_oxy2_7, joback_oxy2_8, joback_oxy2_9, joback_oxy2_10];

    var joback_nitro2_1=$("#joback_nitro2_1").val().toNum();
    var joback_nitro2_2=$("#joback_nitro2_2").val().toNum();
    var joback_nitro2_3=$("#joback_nitro2_3").val().toNum();
    var joback_nitro2_4=$("#joback_nitro2_4").val().toNum();
    var joback_nitro2_5=$("#joback_nitro2_5").val().toNum();
    var joback_nitro2_6=$("#joback_nitro2_6").val().toNum();
    var joback_nitro2_7=$("#joback_nitro2_7").val().toNum();

    var joback_nitro2=[joback_nitro2_1, joback_nitro2_2, joback_nitro2_3, joback_nitro2_4, joback_nitro2_5, joback_nitro2_6, joback_nitro2_7];


    var joback_sulphur2_1=$("#joback_sulphur2_1").val().toNum();
    var joback_sulphur2_2=$("#joback_sulphur2_2").val().toNum();
    var joback_sulphur2_3=$("#joback_sulphur2_3").val().toNum();

    var joback_sulphur2=[joback_sulphur2_1, joback_sulphur2_2, joback_sulphur2_3];

     var joback_nr3_1=$("#joback_nr3_1").val().toNum();
    var joback_nr3_2=$("#joback_nr3_2").val().toNum();
    var joback_nr3_3=$("#joback_nr3_3").val().toNum();
    var joback_nr3_4=$("#joback_nr3_4").val().toNum();
    var joback_nr3_5=$("#joback_nr3_5").val().toNum();
    var joback_nr3_6=$("#joback_nr3_6").val().toNum();
    var joback_nr3_7=$("#joback_nr3_7").val().toNum();
    var joback_nr3_8=$("#joback_nr3_8").val().toNum();
    var joback_nr3_9=$("#joback_nr3_9").val().toNum();
    var joback_nr3_10=$("#joback_nr3_10").val().toNum();

    var joback_nr3=[joback_nr3_1, joback_nr3_2, joback_nr3_3, joback_nr3_4, joback_nr3_5, joback_nr3_6, joback_nr3_7, joback_nr3_8, joback_nr3_9, joback_nr3_10];

    var joback_r3_1=$("#joback_r3_1").val().toNum();
    var joback_r3_2=$("#joback_r3_2").val().toNum();
    var joback_r3_3=$("#joback_r3_3").val().toNum();
    var joback_r3_4=$("#joback_r3_4").val().toNum();
    var joback_r3_5=$("#joback_r3_5").val().toNum();

    var joback_r3=[joback_r3_1, joback_r3_2, joback_r3_3, joback_r3_4, joback_r3_5];

    var joback_halo3_1=$("#joback_halo3_1").val().toNum();
    var joback_halo3_2=$("#joback_halo3_2").val().toNum();
    var joback_halo3_3=$("#joback_halo3_3").val().toNum();
    var joback_halo3_4=$("#joback_halo3_4").val().toNum();

    var joback_halo3=[joback_halo3_1, joback_halo3_2, joback_halo3_3, joback_halo3_4];

    var joback_oxy3_1=$("#joback_oxy3_1").val().toNum();
    var joback_oxy3_2=$("#joback_oxy3_2").val().toNum();
    var joback_oxy3_3=$("#joback_oxy3_3").val().toNum();
    var joback_oxy3_4=$("#joback_oxy3_4").val().toNum();
    var joback_oxy3_5=$("#joback_oxy3_5").val().toNum();
    var joback_oxy3_6=$("#joback_oxy3_6").val().toNum();
    var joback_oxy3_7=$("#joback_oxy3_7").val().toNum();
    var joback_oxy3_8=$("#joback_oxy3_8").val().toNum();
    var joback_oxy3_9=$("#joback_oxy3_9").val().toNum();
    var joback_oxy3_10=$("#joback_oxy3_10").val().toNum();

    var joback_oxy3=[joback_oxy3_1, joback_oxy3_2, joback_oxy3_3, joback_oxy3_4, joback_oxy3_5, joback_oxy3_6, joback_oxy3_7, joback_oxy3_8, joback_oxy3_9, joback_oxy3_10];

    var joback_nitro3_1=$("#joback_nitro3_1").val().toNum();
    var joback_nitro3_2=$("#joback_nitro3_2").val().toNum();
    var joback_nitro3_3=$("#joback_nitro3_3").val().toNum();
    var joback_nitro3_4=$("#joback_nitro3_4").val().toNum();
    var joback_nitro3_5=$("#joback_nitro3_5").val().toNum();
    var joback_nitro3_6=$("#joback_nitro3_6").val().toNum();
    var joback_nitro3_7=$("#joback_nitro3_7").val().toNum();

    var joback_nitro3=[joback_nitro3_1, joback_nitro3_2, joback_nitro3_3, joback_nitro3_4, joback_nitro3_5, joback_nitro3_6, joback_nitro3_7];


    var joback_sulphur3_1=$("#joback_sulphur3_1").val().toNum();
    var joback_sulphur3_2=$("#joback_sulphur3_2").val().toNum();
    var joback_sulphur3_3=$("#joback_sulphur3_3").val().toNum();

    var joback_sulphur3=[joback_sulphur3_1, joback_sulphur3_2, joback_sulphur3_3];

   var joback_nr4_1=$("#joback_nr4_1").val().toNum();
    var joback_nr4_2=$("#joback_nr4_2").val().toNum();
    var joback_nr4_3=$("#joback_nr4_3").val().toNum();
    var joback_nr4_4=$("#joback_nr4_4").val().toNum();
    var joback_nr4_5=$("#joback_nr4_5").val().toNum();
    var joback_nr4_6=$("#joback_nr4_6").val().toNum();
    var joback_nr4_7=$("#joback_nr4_7").val().toNum();
    var joback_nr4_8=$("#joback_nr4_8").val().toNum();
    var joback_nr4_9=$("#joback_nr4_9").val().toNum();
    var joback_nr4_10=$("#joback_nr4_10").val().toNum();

    var joback_nr4=[joback_nr4_1, joback_nr4_2, joback_nr4_3, joback_nr4_4, joback_nr4_5, joback_nr4_6, joback_nr4_7, joback_nr4_8, joback_nr4_9, joback_nr4_10];

    var joback_r4_1=$("#joback_r4_1").val().toNum();
    var joback_r4_2=$("#joback_r4_2").val().toNum();
    var joback_r4_3=$("#joback_r4_3").val().toNum();
    var joback_r4_4=$("#joback_r4_4").val().toNum();
    var joback_r4_5=$("#joback_r4_5").val().toNum();

    var joback_r4=[joback_r4_1, joback_r4_2, joback_r4_3, joback_r4_4, joback_r4_5];

    var joback_halo4_1=$("#joback_halo4_1").val().toNum();
    var joback_halo4_2=$("#joback_halo4_2").val().toNum();
    var joback_halo4_3=$("#joback_halo4_3").val().toNum();
    var joback_halo4_4=$("#joback_halo4_4").val().toNum();

    var joback_halo4=[joback_halo4_1, joback_halo4_2, joback_halo4_3, joback_halo4_4];

    var joback_oxy4_1=$("#joback_oxy4_1").val().toNum();
    var joback_oxy4_2=$("#joback_oxy4_2").val().toNum();
    var joback_oxy4_3=$("#joback_oxy4_3").val().toNum();
    var joback_oxy4_4=$("#joback_oxy4_4").val().toNum();
    var joback_oxy4_5=$("#joback_oxy4_5").val().toNum();
    var joback_oxy4_6=$("#joback_oxy4_6").val().toNum();
    var joback_oxy4_7=$("#joback_oxy4_7").val().toNum();
    var joback_oxy4_8=$("#joback_oxy4_8").val().toNum();
    var joback_oxy4_9=$("#joback_oxy4_9").val().toNum();
    var joback_oxy4_10=$("#joback_oxy4_10").val().toNum();

    var joback_oxy4=[joback_oxy4_1, joback_oxy4_2, joback_oxy4_3, joback_oxy4_4, joback_oxy4_5, joback_oxy4_6, joback_oxy4_7, joback_oxy4_8, joback_oxy4_9, joback_oxy4_10];

    var joback_nitro4_1=$("#joback_nitro4_1").val().toNum();
    var joback_nitro4_2=$("#joback_nitro4_2").val().toNum();
    var joback_nitro4_3=$("#joback_nitro4_3").val().toNum();
    var joback_nitro4_4=$("#joback_nitro4_4").val().toNum();
    var joback_nitro4_5=$("#joback_nitro4_5").val().toNum();
    var joback_nitro4_6=$("#joback_nitro4_6").val().toNum();
    var joback_nitro4_7=$("#joback_nitro4_7").val().toNum();

    var joback_nitro4=[joback_nitro4_1, joback_nitro4_2, joback_nitro4_3, joback_nitro4_4, joback_nitro4_5, joback_nitro4_6, joback_nitro4_7];


    var joback_sulphur4_1=$("#joback_sulphur4_1").val().toNum();
    var joback_sulphur4_2=$("#joback_sulphur4_2").val().toNum();
    var joback_sulphur4_3=$("#joback_sulphur4_3").val().toNum();

    var joback_sulphur4=[joback_sulphur4_1, joback_sulphur4_2, joback_sulphur4_3];

   var joback_nr5_1=$("#joback_nr5_1").val().toNum();
    var joback_nr5_2=$("#joback_nr5_2").val().toNum();
    var joback_nr5_3=$("#joback_nr5_3").val().toNum();
    var joback_nr5_4=$("#joback_nr5_4").val().toNum();
    var joback_nr5_5=$("#joback_nr5_5").val().toNum();
    var joback_nr5_6=$("#joback_nr5_6").val().toNum();
    var joback_nr5_7=$("#joback_nr5_7").val().toNum();
    var joback_nr5_8=$("#joback_nr5_8").val().toNum();
    var joback_nr5_9=$("#joback_nr5_9").val().toNum();
    var joback_nr5_10=$("#joback_nr5_10").val().toNum();

    var joback_nr5=[joback_nr5_1, joback_nr5_2, joback_nr5_3, joback_nr5_4, joback_nr5_5, joback_nr5_6, joback_nr5_7, joback_nr5_8, joback_nr5_9, joback_nr5_10];

    var joback_r5_1=$("#joback_r5_1").val().toNum();
    var joback_r5_2=$("#joback_r5_2").val().toNum();
    var joback_r5_3=$("#joback_r5_3").val().toNum();
    var joback_r5_4=$("#joback_r5_4").val().toNum();
    var joback_r5_5=$("#joback_r5_5").val().toNum();

    var joback_r5=[joback_r5_1, joback_r5_2, joback_r5_3, joback_r5_4, joback_r5_5];

    var joback_halo5_1=$("#joback_halo5_1").val().toNum();
    var joback_halo5_2=$("#joback_halo5_2").val().toNum();
    var joback_halo5_3=$("#joback_halo5_3").val().toNum();
    var joback_halo5_4=$("#joback_halo5_4").val().toNum();

    var joback_halo5=[joback_halo5_1, joback_halo5_2, joback_halo5_3, joback_halo5_4];

    var joback_oxy5_1=$("#joback_oxy5_1").val().toNum();
    var joback_oxy5_2=$("#joback_oxy5_2").val().toNum();
    var joback_oxy5_3=$("#joback_oxy5_3").val().toNum();
    var joback_oxy5_4=$("#joback_oxy5_4").val().toNum();
    var joback_oxy5_5=$("#joback_oxy5_5").val().toNum();
    var joback_oxy5_6=$("#joback_oxy5_6").val().toNum();
    var joback_oxy5_7=$("#joback_oxy5_7").val().toNum();
    var joback_oxy5_8=$("#joback_oxy5_8").val().toNum();
    var joback_oxy5_9=$("#joback_oxy5_9").val().toNum();
    var joback_oxy5_10=$("#joback_oxy5_10").val().toNum();

    var joback_oxy5=[joback_oxy5_1, joback_oxy5_2, joback_oxy5_3, joback_oxy5_4, joback_oxy5_5, joback_oxy5_6, joback_oxy5_7, joback_oxy5_8, joback_oxy5_9, joback_oxy5_10];

    var joback_nitro5_1=$("#joback_nitro5_1").val().toNum();
    var joback_nitro5_2=$("#joback_nitro5_2").val().toNum();
    var joback_nitro5_3=$("#joback_nitro5_3").val().toNum();
    var joback_nitro5_4=$("#joback_nitro5_4").val().toNum();
    var joback_nitro5_5=$("#joback_nitro5_5").val().toNum();
    var joback_nitro5_6=$("#joback_nitro5_6").val().toNum();
    var joback_nitro5_7=$("#joback_nitro5_7").val().toNum();

    var joback_nitro5=[joback_nitro5_1, joback_nitro5_2, joback_nitro5_3, joback_nitro5_4, joback_nitro5_5, joback_nitro5_6, joback_nitro5_7];


    var joback_sulphur5_1=$("#joback_sulphur5_1").val().toNum();
    var joback_sulphur5_2=$("#joback_sulphur5_2").val().toNum();
    var joback_sulphur5_3=$("#joback_sulphur5_3").val().toNum();

    var joback_sulphur5=[joback_sulphur5_1, joback_sulphur5_2, joback_sulphur5_3];

    var joback_1=joback_nr1.concat(joback_r1,joback_halo1,joback_oxy1,joback_nitro1,joback_sulphur1);
    joback_1=replaceNaN(joback_1);
    catscope.joback_1=joback_1;

    var joback_2=joback_nr2.concat(joback_r2,joback_halo2,joback_oxy2,joback_nitro2,joback_sulphur2);
    joback_2=replaceNaN(joback_2);
    catscope.joback_2=joback_2;

    var joback_3=joback_nr3.concat(joback_r3,joback_halo3,joback_oxy3,joback_nitro3,joback_sulphur3);
    joback_3=replaceNaN(joback_3);
    catscope.joback_3=joback_3;

    var joback_4=joback_nr4.concat(joback_r4,joback_halo4,joback_oxy4,joback_nitro4,joback_sulphur4);
    joback_4=replaceNaN(joback_4);
    catscope.joback_4=joback_4;

     var joback_5=joback_nr5.concat(joback_r5,joback_halo5,joback_oxy5,joback_nitro5,joback_sulphur5);
    joback_5=replaceNaN(joback_5);
    catscope.joback_5=joback_5;

    var joback=joback_1.concat(joback_2,joback_3,joback_4,joback_5);
   catscope.joback=joback;

  });
  ////////////////////////////////////////////////////////////////////
  //Physical Properties
  $("#boiling_point_1,#boiling_point_2, #boiling_point_3,#boiling_point_4, #boiling_point_5,#dialog_1_calculate").on('keyup keydown change click', function (){
  var dTc_array=[0.0141,0.0189,0.0164,0.0067,0.0113,0.0129,0.0117,0.0026,0.0027,0.002,0.01,0.0122,0.0042,0.0082,0.0143,0.0111,0.0105,0.0133,0.0068,0.0741,0.024,0.0168,0.0098,0.038,0.0284,0.0379,0.0791,0.0481,0.0143,0.0243,0.0295,0.013,0.0169,0.0085,0.0496,0.0437,0.0031,0.0119,0.0019];
     catscope.dTc_array=dTc_array;

     var dPc_array=[-0.0012,0,0.002,0.0043,-0.0028,-0.0006,0.0011,0.0028,-0.0008,0.0016,0.0025,0.0004,0.0061,0.0011,0.0008,-0.0057,-0.0049,0.0057,-0.0034,0.0112,0.0184,0.0015,0.0048,0.0031,0.0028,0.003,0.0077,0.0005,0.0101,0.0109,0.0077,0.0114,0.0074,0.0076,-0.0101,0.0064,0.0084,0.0049,0.0051];
     catscope.dPc_array=dPc_array;

     var dVc_array=[65,56,41,27,56,46,38,36,46,37,48,38,27,41,32,27,58,71,97,28,-25,18,13,62,55,82,89,82,36,38,35,29,9,34,91,91,63,54,38];
     catscope.dVc_array=dVc_array;

     var atoms_array=[4,3,2,1,3,2,1,1,2,1,3,2,1,2,1,1,1,1,1,2,2,1,1,2,2,3,4,3,1,3,2,2,1,1,2,2,2,1,1];//used in critical pressure
     catscope.atoms_array=atoms_array;

     var dMW_array=[15,14,13,12,14,13,12,12,13,12,14,13,12,13,12,19,35.5,79.9,126.9,17,17,16,16,28,28,29,45,44,16,16,15,15,14,14,26,46,33,32,32];
     catscope.dMW_array=dMW_array;

     var dCp_a_array=[1.95E1,-9.09E-1,-2.3E1,-6.62E1,2.36E1,-8,-2.81E1,2.74E1,2.45E1,7.87,-6.03,-2.05E1,-9.09E1,-2.14,-8.25,2.65E1,3.33E1,2.86E1,3.21E1,2.57E1,-2.81,2.55E1,1.22E1,6.45,3.04E1,3.09E1,2.41E1,2.45E1,6.82,2.69E1,-1.21,1.18E1,-3.11E1,8.83,3.65E1,2.59E1,3.53E1,1.96E1,1.67E1];
     catscope.dCp_a_array=dCp_a_array;

     var dCp_b_array=[-8.08E-3,9.5E-2,2.04E-1,4.27E-1,-3.81E-2,1.05E-1,2.08E-1,-5.57E-2,-2.71E-2,2.01E-2,8.54E-2,1.62E-1,5.57E-1,5.74E-2,1.01E-1,-9.13E-2,-9.63E-2,-6.49E-2,-6.41E-2,-6.91E-2,1.11E-1,-6.32E-2,-1.26E-2,6.7E-2,-8.29E-2,-3.36E-2,4.27E-2,4.02E-2,1.96E-2,-4.12E-2,7.62E-2,-2.3E-2,2.27E-1,-3.84E-3,-7.33E-2,-3.74E-3,-7.58E-2,-5.61E-3,4.81E-3];
     catscope.dCp_b_array=dCp_b_array;

     var dCp_c_array=[1.53E-4,-5.44E-5,-2.65E-4,-6.41E-4,1.72E-4,-9.63E-5,-3.06E-4,1.01E-4,1.11E-4,-8.33E-6,-8E-6,-1.6E-4,-9E-4,-1.64E-6,-1.42E-4,1.91E-4,1.87E-4,1.36E-4,1.26E-4,1.77E-4,-1.16E-4,1.11E-4,6.03E-5,-3.57E-5,2.36E-4,1.6E-4,8.04E-5,4.02E-5,1.27E-5,1.64E-4,-4.86E-4,1.07E-4,-3.2E-4,4.35E-5,1.84E-4,1.29E-4,1.85E-4,4.02E-5,2.77E-5];
     catscope.dCp_c_array=dCp_c_array;

     var dCp_d_array=[-9.67E-8,1.19E-8,1.2E-7,3.01E-7,-1.03E-7,3.56E-8,1.46E-7,-5.02E-8,-6.78E-8,1.39E-9,-1.8E-8,6.24E-8,4.69E-7,-1.59E-8,6.78E-8,-1.03E-7,-9.96E-8,-7.45E-8,-6.87E-8,-9.88E-8,4.94E-8,-5.48E-8,-3.86E-8,2.86E-9,-1.31E-7,-9.88E-8,-6.87E-8,-4.52E-8,-1.78E-8,-9.76E-8,1.05E-8,-6.28E-8,1.46E-7,-2.6E-8,-1.03E-7,-8.88E-8,-1.03E-7,-2.76E-8,-2.11E-8];
     catscope.dCp_d_array=dCp_d_array;

//liquid viscosity method 3

     var total_no_atoms_array=total_no_atoms_fun(catscope);
     catscope.total_no_atoms_array=total_no_atoms_array;

    var joback_Tc_array=joback_Tc_fun(catscope); // Critical Temperature
    catscope.joback_Tc_array=joback_Tc_array;

    var joback_Pc_array=joback_Pc_fun(catscope); //Critical Pressure(bar)
    catscope.joback_Pc_array=joback_Pc_array;

    var joback_Vc_array=joback_Vc_fun(catscope); //Critical volume(cm3/mol)
    catscope.joback_Vc_array=joback_Vc_array;

    var joback_MW_array=joback_MW_fun(catscope);// Molecular Weight calculated from Joback Groups
    catscope.joback_MW_array=joback_MW_array;

    var joback_Tr_array=joback_Tr_fun(catscope);// Reduced Temperature
    catscope.joback_Tr_array=joback_Tr_array;

    var joback_Tr_273_array=joback_Tr_273_fun(catscope);// Reduced Temperature at 273K
    catscope.joback_Tr_273_array=joback_Tr_273_array;

    var pureidealgasdensity_array=pureidealgasdensity_fun(catscope);
    catscope.pureidealgasdensity_array=pureidealgasdensity_array;

    var thodos_viscosity_array=thodos_viscosity_fun(catscope);// viscosity of gas
    catscope.thodos_viscosity_array=thodos_viscosity_array;

    var licht_viscosity_array=licht_viscosity_fun(catscope);// viscosity of gas
    catscope.licht_viscosity_array=licht_viscosity_array;

    var joback_Cp=joback_Cp_fun(catscope);//heat capacity of gas

    catscope.joback_Cp_mol_array=joback_Cp[0];
    catscope.joback_Cp_kg_array=joback_Cp[1];
    catscope.joback_Cv_mol_array=joback_Cp[2];

    var stiel_kf_array=stiel_kf_fun(catscope);//thermal conductivity of gas
    catscope.stiel_kf_array=stiel_kf_array;

    var lee_acentric_array=lee_acentric_fun(catscope);//acentric factor
    catscope.lee_acentric_array=lee_acentric_array;

    var new_acentric_array=new_acentric_fun(catscope);//acentric factor
    catscope.new_acentric_array=new_acentric_array;

    var comp_density_array=rackett_density_fun(catscope);

    catscope.joback_Zc_array=comp_density_array[0];
    catscope.rackett_density_array=comp_density_array[1]; // liquid density kg/m3

    var rowlinson_Cp_array=rowlinson_Cp_fun(catscope);// Liquid heat capacity J/kg-K
    catscope.rowlinson_Cp_array=rowlinson_Cp_array;

    var new_Cp_array=new_Cp_fun(catscope);// Liquid heat capacity J/kg-K
    catscope.new_Cp_array=new_Cp_array;

    var stiel_viscosity_array=stiel_viscosity_fun(catscope);//liquid viscosity for Tr>0.75
    catscope.stiel_viscosity_array=stiel_viscosity_array;

    var hiroshi_viscosity_array=hiroshi_viscosity_fun(catscope);//liquid viscosity for Tr>0.75
    catscope.hiroshi_viscosity_array=hiroshi_viscosity_array;

//    var sridhar_viscosity_array = sridhar_viscosity_fun(catscope);
//     catscope.sridhar_viscosity_array=sridhar_viscosity_array;

    var baroncini_kf_array=baroncini_kf_fun(catscope);// Liquid heat capacity J/kg-K
    catscope.baroncini_kf_array=baroncini_kf_array;

    var inorganic_acid_array=inorganic_acid_fun(catscope);
       catscope.inorganic_acidv_array=inorganic_acid_array[0];
       catscope.inorganic_acidtc_array=inorganic_acid_array[1];
       catscope.inorganic_acidd_array=inorganic_acid_array[2];
       catscope.inorganic_acidhc_array=inorganic_acid_array[3];
       catscope.inorganic_acidct_array=inorganic_acid_array[4];
       catscope.inorganic_acidcp_array=inorganic_acid_array[5];
       catscope.inorganic_acidgasv_array=inorganic_acid_array[6];
       catscope.inorganic_acidgastc_array=inorganic_acid_array[7];
       catscope.inorganic_acidgasd_array=inorganic_acid_array[8];
       catscope.inorganic_acidgashc_array=inorganic_acid_array[9];

    var common_used_gas_array=common_used_gas_fun(catscope);
          catscope.common_used_gasv_array=common_used_gas_array[0];
          catscope.common_used_gastc_array=common_used_gas_array[1];
          catscope.common_used_gashc_array=common_used_gas_array[2];
          catscope.common_used_gasd_array=common_used_gas_array[3];
          catscope.common_used_gasct_array=common_used_gas_array[4];
          catscope.common_used_gascp_array=common_used_gas_array[5];
          catscope.common_used_gasliquidv_array=common_used_gas_array[6];
          catscope.common_used_gasliquidtc_array=common_used_gas_array[7];
          catscope.common_used_gasliquidd_array=common_used_gas_array[8];
          catscope.common_used_gasliquidhc_array=common_used_gas_array[9];

    var outputTrNames=["#reducedtemperature1, #reducedtemperature2, #reducedtemperature3, #reducedtemperature4, #reducedtemperature5"];
    var outputCpNames=["#heatcapacity1","#heatcapacity2","#heatcapacity3","#heatcapacity4","#heatcapacity5"];
    var outputviscNames=["#fluidvisc1","#fluidvisc2","#fluidvisc3","#fluidvisc4","#fluidvisc5"];
    var outputthermalcondNames=["#thermalcond1","#thermalcond2","#thermalcond3","#thermalcond4","#thermalcond5"];
    var outputdensityNames=["#liq_density1","#liq_density2","#liq_density3","#liq_density4","#liq_density5"];
    var outputwarning=["#warning_section"];
    var outputnote=["#notes_section"];

    var criticaltemperature1_out="#criticaltemperature1";
    var criticaltemperature2_out="#criticaltemperature2";
    var criticaltemperature3_out="#criticaltemperature3";
    var criticaltemperature4_out="#criticaltemperature4";
    var criticaltemperature5_out="#criticaltemperature5";
    var criticalpressure1_out="#criticalpressure1";
    var criticalpressure2_out="#criticalpressure2";
    var criticalpressure3_out="#criticalpressure3";
    var criticalpressure4_out="#criticalpressure4";
    var criticalpressure5_out="#criticalpressure5";
    var heatcapacity1_out="#heatcapacity1";
    var heatcapacity2_out="#heatcapacity2";
    var heatcapacity3_out="#heatcapacity3";
    var heatcapacity4_out="#heatcapacity4";
    var heatcapacity5_out="#heatcapacity5";
    var fluidvisc1_out="#fluidvisc1";
    var fluidvisc2_out="#fluidvisc2";
    var fluidvisc3_out="#fluidvisc3";
    var fluidvisc4_out="#fluidvisc4";
    var fluidvisc5_out="#fluidvisc5";
    var thermalcond1_out="#thermalcond1";
    var thermalcond2_out="#thermalcond2";
    var thermalcond3_out="#thermalcond3";
    var thermalcond4_out="#thermalcond4";
    var thermalcond5_out="#thermalcond5";
    var liq_density1_out="#liq_density1";
    var liq_density2_out="#liq_density2";
    var liq_density3_out="#liq_density3";
    var liq_density4_out="#liq_density4";
    var liq_density5_out="#liq_density5";

      var dr_reaction_phase = $("#dr_reaction_phase").val();
      catscope.dr_reaction_phase = dr_reaction_phase;
/*
      var chosen_phase_1 = $("#chosen_phase_1").val().toNum();
      var chosen_phase_2 = $("#chosen_phase_2").val().toNum();
      var chosen_phase_3 = $("#chosen_phase_3").val().toNum();
      var chosen_phase_4 = $("#chosen_phase_4").val().toNum();
      var chosen_phase_5 = $("#chosen_phase_5").val().toNum();

      catscope.chosen_phase_1=chosen_phase_1;
      catscope.chosen_phase_2=chosen_phase_2;
      catscope.chosen_phase_3=chosen_phase_3;
      catscope.chosen_phase_4=chosen_phase_4;
      catscope.chosen_phase_5=chosen_phase_5;
*/
    if(catscope.dr_reaction_phase == "Gas Phase"){
    	for(i=0;i<5;i++){
    		if( catscope.joback_Cp_kg_array[i] != 0 && catscope.thodos_viscosity_array[i] != 0 && catscope.stiel_kf_array[i] != 0 && catscope.common_used_gashc_array[i] == 0 && catscope.common_used_gasv_array[i] ==0 && catscope.common_used_gastc_array[i] ==0){
    			writeOut(outputCpNames[i],catscope.joback_Cp_kg_array[i])
    			writeOut(outputviscNames[i],catscope.thodos_viscosity_array[i])
    			writeOut(outputthermalcondNames[i],catscope.stiel_kf_array[i])
          writeOut(outputwarning[i],"Fluid viscosity might not be accurate for component with -OH and Nitrogen group.Please double check the value if component contain -OH and Nitrogen group.")
    		}else if ( catscope.common_used_gashc_array[i] != 0 && catscope.common_used_gasv_array[i] !=0 && catscope.common_used_gastc_array[i] !=0 || catscope.joback_Cp_kg_array[i] != 0 || catscope.thodos_viscosity_array[i] !=0 || catscope.stiel_kf_array[i] !=0){
          writeOut(outputCpNames[i],catscope.common_used_gashc_array[i])
          writeOut(outputviscNames[i],catscope.common_used_gasv_array[i])
          writeOut(outputthermalcondNames[i],catscope.common_used_gastc_array[i])
        }

    	}

    }else if(catscope.dr_reaction_phase == "Liquid Phase"){
        for(i=0;i<5;i++){
          if(catscope.temp < 350  && catscope.rackett_density_array[i] != 0 && catscope.new_Cp_array[i] != 0 && catscope.hiroshi_viscosity_array[i] != 0 && catscope.baroncini_kf_array[i] != 0 && catscope.inorganic_acidd_array[i] != 0  && catscope.inorganic_acidv_array[i] != 0 && catscope.inorganic_acidtc_array[i] == 0){
              writeOut(outputdensityNames[i],catscope.rackett_density_array[i])
              writeOut(outputCpNames[i],catscope.new_Cp_array[i])
              writeOut(outputviscNames[i],catscope.hiroshi_viscosity_array[i])
              writeOut(outputthermalcondNames[i],catscope.baroncini_kf_array[i])
              writeOut(outputwarning[i],"Fluid viscosity might not be accurate for (1) liquid phase lower than 350K (2) high polarity components when using group contribution method. Please double check the value.")
      } else if(catscope.temp >= 350  && catscope.rackett_density_array[i] != 0 && catscope.new_Cp_array[i] != 0 && catscope.hiroshi_viscosity_array[i] != 0 && catscope.baroncini_kf_array[i] != 0 && catscope.inorganic_acidd_array[i] != 0  && catscope.inorganic_acidv_array[i] != 0 && catscope.inorganic_acidtc_array[i] == 0){
                writeOut(outputdensityNames[i],catscope.rackett_density_array[i])
                writeOut(outputCpNames[i],catscope.new_Cp_array[i])
    			      writeOut(outputviscNames[i],catscope.hiroshi_viscosity_array[i])
    			      writeOut(outputthermalcondNames[i],catscope.baroncini_kf_array[i])
                writeOut(outputwarning[i],"")
        }else if(catscope.inorganic_acidd_array[i] != 0  && catscope.inorganic_acidv_array[i] != 0 && catscope.inorganic_acidtc_array[i] != 0  || catscope.rackett_density_array[i] != 0 || catscope.new_Cp_array[i] != 0 || catscope.hiroshi_viscosity_array[i] != 0 && catscope.baroncini_kf_array[i] == 0){
                writeOut(outputdensityNames[i],catscope.inorganic_acidd_array[i])
                writeOut(outputviscNames[i],catscope.inorganic_acidv_array[i])
                writeOut(outputthermalcondNames[i],catscope.inorganic_acidtc_array[i])
                writeOut(outputCpNames[i],catscope.inorganic_acidhc_array[i])
        }
        else{
        }
            }
        };
        /*
        else if(catscope.dr_reaction_phase == "Trickle Bed(Gas-Liquid)"){
          for(i=0;i<5;i++){
          if(catscope.inorganic_acidd_array[0]!= 0  && catscope.inorganic_acidv_array[0] != 0 && catscope.inorganic_acidtc_array[0] == 0 && catscope.baroncini_kf_array[0] != 0 &&  catscope.common_used_gashc_array[0] == 0 && catscope.common_used_gasv_array[0] ==0 && catscope.common_used_gastc_array[0] == 0 ){
                  writeOut(criticaltemperature1_out,catscope.joback_Tc_array[0])
                  writeOut(criticalpressure1_out,catscope.joback_Pc_array[0])
                  writeOut(liq_density1_out,catscope.rackett_density_array[0])
                  writeOut(heatcapacity1_out,catscope.new_Cp_array[0])
                  writeOut(fluidvisc1_out, catscope.hiroshi_viscosity_array[0])
                  writeOut(thermalcond1_out,catscope.baroncini_kf_array[0])
          }else if( catscope.inorganic_acidd_array[0] != 0  && catscope.inorganic_acidv_array[0] != 0 && catscope.inorganic_acidtc_array[0] != 0  && catscope.baroncini_kf_array[0] == 0  && catscope.common_used_gashc_array[0] == 0 && catscope.common_used_gasv_array[0] ==0 && catscope.common_used_gastc_array[0] == 0){
                  writeOut(criticaltemperature1_out,catscope.inorganic_acidct_array[0])
                  writeOut(criticalpressure1_out,catscope.inorganic_acidcp_array[0])
                  writeOut(liq_density1_out,catscope.inorganic_acidd_array[0])
                  writeOut(fluidvisc1_out,catscope.inorganic_acidv_array[0])
                  writeOut(thermalcond1_out,catscope.inorganic_acidtc_array[0])
                  writeOut(heatcapacity1_out,catscope.inorganic_acidhc_array[0])
          }else if(catscope.common_used_gashc_array[0] == 0 && catscope.common_used_gasv_array[0] == 0 && catscope.common_used_gastc_array[0] == 0 && catscope.baroncini_kf_array[0] == 0 && catscope.inorganic_acidtc_array[0] == 0 ){
                  writeOut(criticaltemperature1_out,catscope.joback_Tc_array[0])
                  writeOut(criticalpressure1_out,catscope.joback_Pc_array[0])
                  writeOut(heatcapacity1_out,catscope.joback_Cp_kg_array[0])
        			    writeOut(fluidvisc1_out,catscope.thodos_viscosity_array[0])
        			    writeOut(thermalcond1_out,catscope.stiel_kf_array[0])
                  writeOut(liq_density1_out,catscope.pureidealgasdensity_array[0])
        	}else if(catscope.common_used_gashc_array[0] != 0 && catscope.common_used_gasv_array[0] !=0 && catscope.common_used_gastc_array[0] !=0  && catscope.baroncini_kf_array[0] == 0 && catscope.inorganic_acidtc_array[0] == 0 ){
                  writeOut(criticaltemperature1_out,catscope.common_used_gasct_array[0])
                  writeOut(criticalpressure1_out,catscope.common_used_gascp_array[0])
                  writeOut(heatcapacity1_out,catscope.common_used_gashc_array[0])
                  writeOut(fluidvisc1_out,catscope.common_used_gasv_array[0])
                  writeOut(thermalcond1_out,catscope.common_used_gastc_array[0])
                  writeOut(liq_density1_out,catscope.common_used_gasd_array[0])
};*/

if(catscope.inorganic_acidd_array[1]!= 0  && catscope.inorganic_acidv_array[1] != 0 && catscope.inorganic_acidtc_array[1] == 0 && catscope.baroncini_kf_array[1] != 0 &&  catscope.common_used_gashc_array[1] == 0 && catscope.common_used_gasv_array[1] ==0 && catscope.common_used_gastc_array[1] == 0 ){
        writeOut(criticaltemperature2_out,catscope.joback_Tc_array[1])
        writeOut(criticalpressure2_out,catscope.joback_Pc_array[1])
        writeOut(liq_density2_out,catscope.rackett_density_array[1])
        writeOut(heatcapacity2_out,catscope.new_Cp_array[1])
        writeOut(fluidvisc2_out, catscope.hiroshi_viscosity_array[1])
        writeOut(thermalcond2_out,catscope.baroncini_kf_array[1])
}else if( catscope.inorganic_acidd_array[1] != 0  && catscope.inorganic_acidv_array[1] != 0 && catscope.inorganic_acidtc_array[1] != 0  && catscope.baroncini_kf_array[1] == 0  && catscope.common_used_gashc_array[1] == 0 && catscope.common_used_gasv_array[1] ==0 && catscope.common_used_gastc_array[1] == 0){
        writeOut(criticaltemperature2_out,catscope.inorganic_acidct_array[1])
        writeOut(criticalpressure2_out,catscope.inorganic_acidcp_array[1])
        writeOut(liq_density2_out,catscope.inorganic_acidd_array[1])
        writeOut(fluidvisc2_out,catscope.inorganic_acidv_array[1])
        writeOut(thermalcond2_out,catscope.inorganic_acidtc_array[1])
        writeOut(heatcapacity2_out,catscope.inorganic_acidhc_array[1])
}else if(catscope.common_used_gashc_array[1] == 0 && catscope.common_used_gasv_array[1] == 0 && catscope.common_used_gastc_array[1] == 0 && catscope.baroncini_kf_array[1] == 0 && catscope.inorganic_acidtc_array[1] == 0 ){
        writeOut(criticaltemperature2_out,catscope.joback_Tc_array[1])
        writeOut(criticalpressure2_out,catscope.joback_Pc_array[1])
        writeOut(heatcapacity2_out,catscope.joback_Cp_kg_array[1])
        writeOut(fluidvisc2_out,catscope.thodos_viscosity_array[1])
        writeOut(thermalcond2_out,catscope.stiel_kf_array[1])
        writeOut(liq_density2_out,catscope.pureidealgasdensity_array[1])
}else if(catscope.common_used_gashc_array[1] != 0 && catscope.common_used_gasv_array[1] !=0 && catscope.common_used_gastc_array[1] !=0  && catscope.baroncini_kf_array[1] == 0 && catscope.inorganic_acidtc_array[1] == 0 ){
        writeOut(criticaltemperature2_out,catscope.common_used_gasct_array[1])
        writeOut(criticalpressure2_out,catscope.common_used_gascp_array[1])
        writeOut(heatcapacity2_out,catscope.common_used_gashc_array[1])
        writeOut(fluidvisc2_out,catscope.common_used_gasv_array[1])
        writeOut(thermalcond2_out,catscope.common_used_gastc_array[1])
        writeOut(liq_density2_out,catscope.common_used_gasd_array[1])
};

if(catscope.inorganic_acidd_array[2]!= 0  && catscope.inorganic_acidv_array[2] != 0 && catscope.inorganic_acidtc_array[2] == 0 && catscope.baroncini_kf_array[2] != 0 &&  catscope.common_used_gashc_array[2] == 0 && catscope.common_used_gasv_array[2] ==0 && catscope.common_used_gastc_array[2] == 0 ){
        writeOut(criticaltemperature3_out,catscope.joback_Tc_array[2])
        writeOut(criticalpressure3_out,catscope.joback_Pc_array[2])
        writeOut(liq_density3_out,catscope.rackett_density_array[2])
        writeOut(heatcapacity3_out,catscope.new_Cp_array[2])
        writeOut(fluidvisc3_out, catscope.hiroshi_viscosity_array[2])
        writeOut(thermalcond3_out,catscope.baroncini_kf_array[2])
}else if( catscope.inorganic_acidd_array[2] != 0  && catscope.inorganic_acidv_array[2] != 0 && catscope.inorganic_acidtc_array[2] != 0  && catscope.baroncini_kf_array[2] == 0  && catscope.common_used_gashc_array[2] == 0 && catscope.common_used_gasv_array[2] ==0 && catscope.common_used_gastc_array[2] == 0){
        writeOut(criticaltemperature3_out,catscope.inorganic_acidct_array[2])
        writeOut(criticalpressure3_out,catscope.inorganic_acidcp_array[2])
        writeOut(liq_density3_out,catscope.inorganic_acidd_array[2])
        writeOut(fluidvisc3_out,catscope.inorganic_acidv_array[2])
        writeOut(thermalcond3_out,catscope.inorganic_acidtc_array[2])
        writeOut(heatcapacity3_out,catscope.inorganic_acidhc_array[2])
}else if(catscope.common_used_gashc_array[2] == 0 && catscope.common_used_gasv_array[2] == 0 && catscope.common_used_gastc_array[2] == 0 && catscope.baroncini_kf_array[2] == 0 && catscope.inorganic_acidtc_array[2] == 0 ){
        writeOut(criticaltemperature3_out,catscope.joback_Tc_array[2])
        writeOut(criticalpressure3_out,catscope.joback_Pc_array[2])
        writeOut(heatcapacity3_out,catscope.joback_Cp_kg_array[2])
        writeOut(fluidvisc3_out,catscope.thodos_viscosity_array[2])
        writeOut(thermalcond3_out,catscope.stiel_kf_array[2])
        writeOut(liq_density3_out,catscope.pureidealgasdensity_array[2])
}else if(catscope.common_used_gashc_array[2] != 0 && catscope.common_used_gasv_array[2] !=0 && catscope.common_used_gastc_array[2] !=0  && catscope.baroncini_kf_array[2] == 0 && catscope.inorganic_acidtc_array[2] == 0 ){
        writeOut(criticaltemperature3_out,catscope.common_used_gasct_array[2])
        writeOut(criticalpressure3_out,catscope.common_used_gascp_array[2])
        writeOut(heatcapacity3_out,catscope.common_used_gashc_array[2])
        writeOut(fluidvisc3_out,catscope.common_used_gasv_array[2])
        writeOut(thermalcond3_out,catscope.common_used_gastc_array[2])
        writeOut(liq_density3_out,catscope.common_used_gasd_array[2])
};

if(catscope.inorganic_acidd_array[3]!= 0  && catscope.inorganic_acidv_array[3] != 0 && catscope.inorganic_acidtc_array[3] == 0 && catscope.baroncini_kf_array[3] != 0 &&  catscope.common_used_gashc_array[3] == 0 && catscope.common_used_gasv_array[3] ==0 && catscope.common_used_gastc_array[3] == 0 ){
        writeOut(criticaltemperature4_out,catscope.joback_Tc_array[3])
        writeOut(criticalpressure4_out,catscope.joback_Pc_array[3])
        writeOut(liq_density4_out,catscope.rackett_density_array[3])
        writeOut(heatcapacity4_out,catscope.new_Cp_array[3])
        writeOut(fluidvisc4_out, catscope.hiroshi_viscosity_array[3])
        writeOut(thermalcond4_out,catscope.baroncini_kf_array[3])
}else if( catscope.inorganic_acidd_array[3] != 0  && catscope.inorganic_acidv_array[3] != 0 && catscope.inorganic_acidtc_array[3] != 0  && catscope.baroncini_kf_array[3] == 0  && catscope.common_used_gashc_array[3] == 0 && catscope.common_used_gasv_array[3] ==0 && catscope.common_used_gastc_array[3] == 0){
        writeOut(criticaltemperature4_out,catscope.inorganic_acidct_array[3])
        writeOut(criticalpressure4_out,catscope.inorganic_acidcp_array[3])
        writeOut(liq_density4_out,catscope.inorganic_acidd_array[3])
        writeOut(fluidvisc4_out,catscope.inorganic_acidv_array[3])
        writeOut(thermalcond4_out,catscope.inorganic_acidtc_array[3])
        writeOut(heatcapacity4_out,catscope.inorganic_acidhc_array[3])
}else if(catscope.common_used_gashc_array[3] == 0 && catscope.common_used_gasv_array[3] == 0 && catscope.common_used_gastc_array[3] == 0 && catscope.baroncini_kf_array[3] == 0 && catscope.inorganic_acidtc_array[3] == 0 ){
        writeOut(criticaltemperature4_out,catscope.joback_Tc_array[3])
        writeOut(criticalpressure4_out,catscope.joback_Pc_array[3])
        writeOut(heatcapacity4_out,catscope.joback_Cp_kg_array[3])
        writeOut(fluidvisc4_out,catscope.thodos_viscosity_array[3])
        writeOut(thermalcond4_out,catscope.stiel_kf_array[3])
        writeOut(liq_density4_out,catscope.pureidealgasdensity_array[3])
}else if(catscope.common_used_gashc_array[3] != 0 && catscope.common_used_gasv_array[3] !=0 && catscope.common_used_gastc_array[3] !=0  && catscope.baroncini_kf_array[3] == 0 && catscope.inorganic_acidtc_array[3] == 0 ){
        writeOut(criticaltemperature4_out,catscope.common_used_gasct_array[3])
        writeOut(criticalpressure4_out,catscope.common_used_gascp_array[3])
        writeOut(heatcapacity4_out,catscope.common_used_gashc_array[3])
        writeOut(fluidvisc4_out,catscope.common_used_gasv_array[3])
        writeOut(thermalcond4_out,catscope.common_used_gastc_array[3])
        writeOut(liq_density4_out,catscope.common_used_gasd_array[3])
};

if(catscope.inorganic_acidd_array[4]!= 0  && catscope.inorganic_acidv_array[4] != 0 && catscope.inorganic_acidtc_array[4] == 0 && catscope.baroncini_kf_array[4] != 0 &&  catscope.common_used_gashc_array[4] == 0 && catscope.common_used_gasv_array[4] ==0 && catscope.common_used_gastc_array[4] == 0 ){
        writeOut(criticaltemperature5_out,catscope.joback_Tc_array[4])
        writeOut(criticalpressure5_out,catscope.joback_Pc_array[4])
        writeOut(liq_density5_out,catscope.rackett_density_array[4])
        writeOut(heatcapacity5_out,catscope.new_Cp_array[4])
        writeOut(fluidvisc5_out, catscope.hiroshi_viscosity_array[4])
        writeOut(thermalcond5_out,catscope.baroncini_kf_array[4])
}else if( catscope.inorganic_acidd_array[4] != 0  && catscope.inorganic_acidv_array[4] != 0 && catscope.inorganic_acidtc_array[4] != 0  && catscope.baroncini_kf_array[4] == 0  && catscope.common_used_gashc_array[4] == 0 && catscope.common_used_gasv_array[4] ==0 && catscope.common_used_gastc_array[4] == 0){
        writeOut(criticaltemperature5_out,catscope.inorganic_acidct_array[4])
        writeOut(criticalpressure5_out,catscope.inorganic_acidcp_array[4])
        writeOut(liq_density5_out,catscope.inorganic_acidd_array[4])
        writeOut(fluidvisc5_out,catscope.inorganic_acidv_array[4])
        writeOut(thermalcond5_out,catscope.inorganic_acidtc_array[4])
        writeOut(heatcapacity5_out,catscope.inorganic_acidhc_array[4])
}else if(catscope.common_used_gashc_array[4] == 0 && catscope.common_used_gasv_array[4] == 0 && catscope.common_used_gastc_array[4] == 0 && catscope.baroncini_kf_array[4] == 0 && catscope.inorganic_acidtc_array[4] == 0 ){
        writeOut(criticaltemperature5_out,catscope.joback_Tc_array[4])
        writeOut(criticalpressure5_out,catscope.joback_Pc_array[4])
        writeOut(heatcapacity5_out,catscope.joback_Cp_kg_array[4])
        writeOut(fluidvisc5_out,catscope.thodos_viscosity_array[4])
        writeOut(thermalcond5_out,catscope.stiel_kf_array[4])
        writeOut(liq_density5_out,catscope.pureidealgasdensity_array[4])
}else if(catscope.common_used_gashc_array[4] != 0 && catscope.common_used_gasv_array[4] !=0 && catscope.common_used_gastc_array[4] !=0  && catscope.baroncini_kf_array[4] == 0 && catscope.inorganic_acidtc_array[4] == 0 ){
        writeOut(criticaltemperature5_out,catscope.common_used_gasct_array[4])
        writeOut(criticalpressure5_out,catscope.common_used_gascp_array[4])
        writeOut(heatcapacity5_out,catscope.common_used_gashc_array[4])
        writeOut(fluidvisc5_out,catscope.common_used_gasv_array[4])
        writeOut(thermalcond5_out,catscope.common_used_gastc_array[4])
        writeOut(liq_density5_out,catscope.common_used_gasd_array[4])
};


});


  //////////////////////////////////////////////////////////////////////////////////
  //fuller diffusion volumes, MW, and molecular formulas for all five possible components
  $("#temp,#pressure").on('keyup keydown change click', function (){
    //first check if the gas field is selected

      //id string of output field
      var outputdvolNames = ["#difvol1","#difvol2","#difvol3","#difvol4","#difvol5"];
      var outputdvolNames_popup = ["#fuller_dvol1","#fuller_dvol2","#fuller_dvol3","#fuller_dvol4","#fuller_dvol5"];
      var outputMWNames = ["#molweight1","#molweight2","#molweight3","#molweight4","#molweight5"];
      var outputMWNames_popup = ["#fuller_molweight1","#fuller_molweight2","#fuller_molweight3","#fuller_molweight4","#fuller_molweight5"];
      var outputformulaNames= ["#fuller_molformula1","#fuller_molformula2","#fuller_molformula3","#fuller_molformula4","#fuller_molformula5"];

      var MW_array = [12.011, 1.008, 15.999, 14.007, 32.066, 18.998, 35.453, 79.904, 126.905];
      var dvol_array = [15.9, 2.3, 6.1, 4.5, 22.9, 14.7, 21.0, 21.9, 29.8, -18.3, -18.3];
      catscope.MW_array = MW_array;
      catscope.dvol_array = dvol_array;


      // in the first section various properties are calculated for all components
      // REGARDLESS of "Custom" vs. non-Custom selection in dr_molname_ selection

      //perform calculation
      var fuller_molweight1 = math.eval('fuller_Array1_mw*transpose(MW_array)',catscope); //calculate molecular weight of "1" by multiplying against MW_array^T
      var fuller_molweight2 = math.eval('fuller_Array2_mw*transpose(MW_array)',catscope);
      var fuller_molweight3 = math.eval('fuller_Array3_mw*transpose(MW_array)',catscope);
      var fuller_molweight4 = math.eval('fuller_Array4_mw*transpose(MW_array)',catscope);
      var fuller_molweight5 = math.eval('fuller_Array5_mw*transpose(MW_array)',catscope);

      var fuller_molformula1 = fullerArrayToFormula(catscope.fuller_Array1_mw); //convert array of numbers into formula string
      var fuller_molformula2 = fullerArrayToFormula(catscope.fuller_Array2_mw);
      var fuller_molformula3 = fullerArrayToFormula(catscope.fuller_Array3_mw);
      var fuller_molformula4 = fullerArrayToFormula(catscope.fuller_Array4_mw);
      var fuller_molformula5 = fullerArrayToFormula(catscope.fuller_Array5_mw);

      var fuller_dvol1 = math.eval('fuller_Array1*transpose(dvol_array)',catscope);
      var fuller_dvol2 = math.eval('fuller_Array2*transpose(dvol_array)',catscope);
      var fuller_dvol3 = math.eval('fuller_Array3*transpose(dvol_array)',catscope);
      var fuller_dvol4 = math.eval('fuller_Array4*transpose(dvol_array)',catscope);
      var fuller_dvol5 = math.eval('fuller_Array5*transpose(dvol_array)',catscope);

      var fuller_molweight_Array = [fuller_molweight1,fuller_molweight2,fuller_molweight3,fuller_molweight4,fuller_molweight5];
      var fuller_dvol_Array = [fuller_dvol1,fuller_dvol2,fuller_dvol3,fuller_dvol4,fuller_dvol5];
      var fuller_molformula_Array = [fuller_molformula1,fuller_molformula2,fuller_molformula3,fuller_molformula4,fuller_molformula5];

      //add result to scope
      catscope.fuller_molweight1 = fuller_molweight1;
      catscope.fuller_molweight2 = fuller_molweight2;
      catscope.fuller_molweight3 = fuller_molweight3;
      catscope.fuller_molweight4 = fuller_molweight4;
      catscope.fuller_molweight5 = fuller_molweight5;

      catscope.fuller_molweight_Array = fuller_molweight_Array;
      catscope.fuller_dvol_Array = fuller_dvol_Array;
      catscope.fuller_molformula_Array = fuller_molformula_Array;

      //define some arrays
      var predefdvolArray = [18.5,16.3,19.7,13.1,18.0,26.9,6.1,2.7,16.2,35.9,20.7,38.4,69.0,41.8];
      var predefdvolNamesArray = ["N2","O2","Air","H2O","CO","CO2","H2","He","Ar","N2O","NH3","Cl2","Br2","SO2"];
      var predefdvolMWArray = [28.014,31.998,28.966,18.016,28.01,44.009,2.016,4.0026,39.948,44.013,17.031,70.906,159.808,64.064];

if (catscope.dr_reaction_phase == "Gas Phase") {
      //use alternate method for dr_molname
      $.each(catscope.dr_molname_Array, function(index,value){
        var j = predefdvolNamesArray.indexOf(value);

        if (!predefdvolNamesArray[j]) { //check if the value is NOT in the Array, specifically for "Custom" molecules
          writeOut(outputformulaNames[index],fuller_molformula_Array[index])
          if (fuller_molweight_Array[index] != 0 && fuller_dvol_Array[index] != 0) { //ONLY write the values if they are NOT zero
            writeOut(outputMWNames[index],fuller_molweight_Array[index])
            writeOut(outputMWNames_popup[index],fuller_molweight_Array[index])
            writeOut(outputdvolNames[index],fuller_dvol_Array[index])
            writeOut(outputdvolNames_popup[index],fuller_dvol_Array[index])
          }
        } else { //else the value is in the array, then use predefined mol weights / formulas / and diffusion volumes
          writeOut(outputformulaNames[index],predefdvolNamesArray[j])
          writeOut(outputMWNames[index],predefdvolMWArray[j])
          writeOut(outputMWNames_popup[index],predefdvolMWArray[j])
          writeOut(outputdvolNames[index],predefdvolArray[j])
          writeOut(outputdvolNames_popup[index],predefdvolArray[j])
          catscope.fuller_molweight_Array[index] = predefdvolMWArray[j];
          catscope.fuller_dvol_Array[index] = predefdvolArray[j];
        }
      });


      // at this point the relevant mol weights / formulas / and diffusion volumes have actually been written to the user interface cell
      // since we need to use the actual values later -- it would be best to read them back into the catscope object for later use


      for (i in catscope.molWeightArray) {
        if (catscope.fuller_molweight_Array[i] > 0) {
          catscope.molWeightArray[i] = catscope.fuller_molweight_Array[i];
        } else {
          //do nothing
        }
      }

      for (i in catscope.diffusion_volume_Array) {
        if (catscope.fuller_dvol_Array[i] > 0) {
          catscope.diffusion_volume_Array[i] = catscope.fuller_dvol_Array[i];//there can be zeros here, which is checked and corrected for later
        } else {
          //do nothing
        }
      }
    }
/*
//////////Trickle bed
if (catscope.dr_reaction_phase == "Trickle Bed(Gas-Liquid)") {
      //use alternate method for dr_molname
      $.each(catscope.dr_molname_Array, function(index,value){
        var j = predefdvolNamesArray.indexOf(value);

        if (!predefdvolNamesArray[j]) { //check if the value is NOT in the Array, specifically for "Custom" molecules
          writeOut(outputformulaNames[index],fuller_molformula_Array[index])
          if (fuller_molweight_Array[index] != 0 && fuller_dvol_Array[index] != 0) { //ONLY write the values if they are NOT zero
            writeOut(outputMWNames[index],fuller_molweight_Array[index])
            writeOut(outputMWNames_popup[index],fuller_molweight_Array[index])
            writeOut(outputdvolNames[index],fuller_dvol_Array[index])
            writeOut(outputdvolNames_popup[index],fuller_dvol_Array[index])
          }
        } else { //else the value is in the array, then use predefined mol weights / formulas / and diffusion volumes
          writeOut(outputformulaNames[index],predefdvolNamesArray[j])
          writeOut(outputMWNames[index],predefdvolMWArray[j])
          writeOut(outputMWNames_popup[index],predefdvolMWArray[j])
          writeOut(outputdvolNames[index],predefdvolArray[j])
          writeOut(outputdvolNames_popup[index],predefdvolArray[j])
          catscope.fuller_molweight_Array[index] = predefdvolMWArray[j];
          catscope.fuller_dvol_Array[index] = predefdvolArray[j];
        }
      });


      // at this point the relevant mol weights / formulas / and diffusion volumes have actually been written to the user interface cell
      // since we need to use the actual values later -- it would be best to read them back into the catscope object for later use


      for (i in catscope.molWeightArray) {
        if (catscope.fuller_molweight_Array[i] > 0) {
          catscope.molWeightArray[i] = catscope.fuller_molweight_Array[i];
        } else {
          //do nothing
        }
      }

      for (i in catscope.diffusion_volume_Array) {
        if (catscope.fuller_dvol_Array[i] > 0) {
          catscope.diffusion_volume_Array[i] = catscope.fuller_dvol_Array[i];//there can be zeros here, which is checked and corrected for later
        } else {
          //do nothing
        }
      }
    }

*/


  });

  //////////////////////////////////////////////////////////////////////////////////
  //calculate binary diffusivities for all 4 possible A dominant pairs (1-2,1-3,1-4,1-5) and mixture diffusivity for GAS
  $("#temp,#pressure").on('keyup keydown change click', function (){
    var molTest = doesItSumToOne(catscope.molFracArray); //currently uses >= 0.995 = 1
    catscope.molTest = molTest;

    //then check if the gas field is selected
    if (catscope.dr_reaction_phase == "Gas Phase") {
      //id string of output field
      var diff_mixture_out = "#diff_mixture"; //output in m^2/s

      catscope.binary_diff_Array = [];

      for (var i = 1; i <= 4; i++) {
        var j = i - 1;
        catscope.binary_diff_Array[j] = fullerBinaryDiff(catscope.molWeightArray[0],catscope.molWeightArray[i],catscope.temp,catscope.pressure,catscope.diffusion_volume_Array[0],catscope.diffusion_volume_Array[i]);
      }

      catscope.binary_diff_Array_noInf = $.extend( true, [], catscope.binary_diff_Array);
      var removeInfIndices = findInfIndices(catscope.binary_diff_Array_noInf);

      catscope.molFracArray_no_A_no_Inf = $.extend( true, [], catscope.molFracArray); //first duplicate array -- special syntax breaks inheritance problems
      catscope.molFracArray_no_A_no_Inf.shift(); // then delete first element by using shift

      for (i in removeInfIndices) {
        var j = removeInfIndices[i] - i;
        catscope.binary_diff_Array_noInf.splice(j,1); //remove elements with diffusion of Infinity -- indicating no input for molecule information
        catscope.molFracArray_no_A_no_Inf.splice(j,1); //remove corresponding elements of molFracArray
      }


      catscope.self_diff_coeffA = fullerBinaryDiff(catscope.molWeightArray[0],catscope.molWeightArray[0],catscope.temp,catscope.pressure,catscope.diffusion_volume_Array[0],catscope.diffusion_volume_Array[0]);

      if (catscope.molTest == true) { //logical test for if mol fractions add to one
        var numerator = math.eval('1-molfrac1',catscope);
        var denominator = math.eval('sum(molFracArray_no_A_no_Inf./binary_diff_Array_noInf)',catscope); //perform elementwise division, then sum elements of array
        var diff_mixture = math.divide(numerator,denominator);

        if (catscope.molfrac1 == 1) {
          catscope.diff_mixture = catscope.self_diff_coeffA;
          writeOut(diff_mixture_out,catscope.self_diff_coeffA); //using a self diffusion coefficient
        } else {
          catscope.diff_mixture = diff_mixture;
          writeOut(diff_mixture_out,diff_mixture);
        }
      } else {
        writeOut(diff_mixture_out,'Sum of Mol Frac. not 1');
      }
    }

    //separate code for liquid phase mixture diffusivity is later
  });


  //////////////////////////////////////////////////////////////////////////////////
  //get Le Bas parameters to calculate molar volumes / mol. weight / formula for liquids
  $("#button_lebas_vb_calculate,#temp").on('keyup keydown change click', function (){


      var lebas_C1 = $("#lebas_C1").val().toNum(); //get Le Bas method values for liquid molar volume calculation
      var lebas_H1 = $("#lebas_H1").val().toNum();
      var lebas_O1 = $("#lebas_O1").val().toNum();
      var lebas_MeEs_O1 = $("#lebas_MeEs_O1").val().toNum();
      var lebas_EtEs_O1 = $("#lebas_EtEs_O1").val().toNum();
      var lebas_HiEs_O1 = $("#lebas_HiEs_O1").val().toNum();
      var lebas_Ac_O1 = $("#lebas_Ac_O1").val().toNum();
      var lebas_tospn_O1 = $("#lebas_tospn_O1").val().toNum();
      var lebas_dbl_N1 = $("#lebas_dbl_N1").val().toNum();
      var lebas_pri_N1 = $("#lebas_pri_N1").val().toNum();
      var lebas_sec_N1 = $("#lebas_sec_N1").val().toNum();
      var lebas_Br1 = $("#lebas_Br1").val().toNum();
      var lebas_Cl1 = $("#lebas_Cl1").val().toNum();
      var lebas_F1 = $("#lebas_F1").val().toNum();
      var lebas_I1 = $("#lebas_I1").val().toNum();
      var lebas_S1 = $("#lebas_S1").val().toNum();
      var lebas_ringThr1 = $("#lebas_ringThr1").val().toNum();
      var lebas_ringFo1 = $("#lebas_ringFo1").val().toNum();
      var lebas_ringFi1 = $("#lebas_ringFi1").val().toNum();
      var lebas_ringSi1 = $("#lebas_ringSi1").val().toNum();
      var lebas_nphth1 = $("#lebas_nphth1").val().toNum();
      var lebas_anthr1 = $("#lebas_anthr1").val().toNum();

      var lebas_C2 = $("#lebas_C2").val().toNum(); //molecule 2
      var lebas_H2 = $("#lebas_H2").val().toNum();
      var lebas_O2 = $("#lebas_O2").val().toNum();
      var lebas_MeEs_O2 = $("#lebas_MeEs_O2").val().toNum();
      var lebas_EtEs_O2 = $("#lebas_EtEs_O2").val().toNum();
      var lebas_HiEs_O2 = $("#lebas_HiEs_O2").val().toNum();
      var lebas_Ac_O2 = $("#lebas_Ac_O2").val().toNum();
      var lebas_tospn_O2 = $("#lebas_tospn_O2").val().toNum();
      var lebas_dbl_N2 = $("#lebas_dbl_N2").val().toNum();
      var lebas_pri_N2 = $("#lebas_pri_N2").val().toNum();
      var lebas_sec_N2 = $("#lebas_sec_N2").val().toNum();
      var lebas_Br2 = $("#lebas_Br2").val().toNum();
      var lebas_Cl2 = $("#lebas_Cl2").val().toNum();
      var lebas_F2 = $("#lebas_F2").val().toNum();
      var lebas_I2 = $("#lebas_I2").val().toNum();
      var lebas_S2 = $("#lebas_S2").val().toNum();
      var lebas_ringThr2 = $("#lebas_ringThr2").val().toNum();
      var lebas_ringFo2 = $("#lebas_ringFo2").val().toNum();
      var lebas_ringFi2 = $("#lebas_ringFi2").val().toNum();
      var lebas_ringSi2 = $("#lebas_ringSi2").val().toNum();
      var lebas_nphth2 = $("#lebas_nphth2").val().toNum();
      var lebas_anthr2 = $("#lebas_anthr2").val().toNum();

      var lebas_C3 = $("#lebas_C3").val().toNum(); //molecule 3
      var lebas_H3 = $("#lebas_H3").val().toNum();
      var lebas_O3 = $("#lebas_O3").val().toNum();
      var lebas_MeEs_O3 = $("#lebas_MeEs_O3").val().toNum();
      var lebas_EtEs_O3 = $("#lebas_EtEs_O3").val().toNum();
      var lebas_HiEs_O3 = $("#lebas_HiEs_O3").val().toNum();
      var lebas_Ac_O3 = $("#lebas_Ac_O3").val().toNum();
      var lebas_tospn_O3 = $("#lebas_tospn_O3").val().toNum();
      var lebas_dbl_N3 = $("#lebas_dbl_N3").val().toNum();
      var lebas_pri_N3 = $("#lebas_pri_N3").val().toNum();
      var lebas_sec_N3 = $("#lebas_sec_N3").val().toNum();
      var lebas_Br3 = $("#lebas_Br3").val().toNum();
      var lebas_Cl3 = $("#lebas_Cl3").val().toNum();
      var lebas_F3 = $("#lebas_F3").val().toNum();
      var lebas_I3 = $("#lebas_I3").val().toNum();
      var lebas_S3 = $("#lebas_S3").val().toNum();
      var lebas_ringThr3 = $("#lebas_ringThr3").val().toNum();
      var lebas_ringFo3 = $("#lebas_ringFo3").val().toNum();
      var lebas_ringFi3 = $("#lebas_ringFi3").val().toNum();
      var lebas_ringSi3 = $("#lebas_ringSi3").val().toNum();
      var lebas_nphth3 = $("#lebas_nphth3").val().toNum();
      var lebas_anthr3 = $("#lebas_anthr3").val().toNum();

      var lebas_C4 = $("#lebas_C4").val().toNum(); //molecule 4
      var lebas_H4 = $("#lebas_H4").val().toNum();
      var lebas_O4 = $("#lebas_O4").val().toNum();
      var lebas_MeEs_O4 = $("#lebas_MeEs_O4").val().toNum();
      var lebas_EtEs_O4 = $("#lebas_EtEs_O4").val().toNum();
      var lebas_HiEs_O4 = $("#lebas_HiEs_O4").val().toNum();
      var lebas_Ac_O4 = $("#lebas_Ac_O4").val().toNum();
      var lebas_tospn_O4 = $("#lebas_tospn_O4").val().toNum();
      var lebas_dbl_N4 = $("#lebas_dbl_N4").val().toNum();
      var lebas_pri_N4 = $("#lebas_pri_N4").val().toNum();
      var lebas_sec_N4 = $("#lebas_sec_N4").val().toNum();
      var lebas_Br4 = $("#lebas_Br4").val().toNum();
      var lebas_Cl4 = $("#lebas_Cl4").val().toNum();
      var lebas_F4 = $("#lebas_F4").val().toNum();
      var lebas_I4 = $("#lebas_I4").val().toNum();
      var lebas_S4 = $("#lebas_S4").val().toNum();
      var lebas_ringThr4 = $("#lebas_ringThr4").val().toNum();
      var lebas_ringFo4 = $("#lebas_ringFo4").val().toNum();
      var lebas_ringFi4 = $("#lebas_ringFi4").val().toNum();
      var lebas_ringSi4 = $("#lebas_ringSi4").val().toNum();
      var lebas_nphth4 = $("#lebas_nphth4").val().toNum();
      var lebas_anthr4 = $("#lebas_anthr4").val().toNum();

      var lebas_C5 = $("#lebas_C5").val().toNum(); //molecule 5
      var lebas_H5 = $("#lebas_H5").val().toNum();
      var lebas_O5 = $("#lebas_O5").val().toNum();
      var lebas_MeEs_O5 = $("#lebas_MeEs_O5").val().toNum();
      var lebas_EtEs_O5 = $("#lebas_EtEs_O5").val().toNum();
      var lebas_HiEs_O5 = $("#lebas_HiEs_O5").val().toNum();
      var lebas_Ac_O5 = $("#lebas_Ac_O5").val().toNum();
      var lebas_tospn_O5 = $("#lebas_tospn_O5").val().toNum();
      var lebas_dbl_N5 = $("#lebas_dbl_N5").val().toNum();
      var lebas_pri_N5 = $("#lebas_pri_N5").val().toNum();
      var lebas_sec_N5 = $("#lebas_sec_N5").val().toNum();
      var lebas_Br5 = $("#lebas_Br5").val().toNum();
      var lebas_Cl5 = $("#lebas_Cl5").val().toNum();
      var lebas_F5 = $("#lebas_F5").val().toNum();
      var lebas_I5 = $("#lebas_I5").val().toNum();
      var lebas_S5 = $("#lebas_S5").val().toNum();
      var lebas_ringThr5 = $("#lebas_ringThr5").val().toNum();
      var lebas_ringFo5 = $("#lebas_ringFo5").val().toNum();
      var lebas_ringFi5 = $("#lebas_ringFi5").val().toNum();
      var lebas_ringSi5 = $("#lebas_ringSi5").val().toNum();
      var lebas_nphth5 = $("#lebas_nphth5").val().toNum();
      var lebas_anthr5 = $("#lebas_anthr5").val().toNum();

      //construct arrays based on above variables for later use in calcualting molar volume, molar weight, and molar formula
      var lebas_Array1 = [lebas_C1,lebas_H1,lebas_O1,lebas_MeEs_O1,lebas_EtEs_O1,lebas_HiEs_O1,lebas_Ac_O1,lebas_tospn_O1,lebas_dbl_N1,lebas_pri_N1,lebas_sec_N1,lebas_Br1,lebas_Cl1,lebas_F1,lebas_I1,lebas_S1,lebas_ringThr1,lebas_ringFo1,lebas_ringFi1,lebas_ringSi1,lebas_nphth1,lebas_anthr1];
      var lebas_Array2 = [lebas_C2,lebas_H2,lebas_O2,lebas_MeEs_O2,lebas_EtEs_O2,lebas_HiEs_O2,lebas_Ac_O2,lebas_tospn_O2,lebas_dbl_N2,lebas_pri_N2,lebas_sec_N2,lebas_Br2,lebas_Cl2,lebas_F2,lebas_I2,lebas_S2,lebas_ringThr2,lebas_ringFo2,lebas_ringFi2,lebas_ringSi2,lebas_nphth2,lebas_anthr2];
      var lebas_Array3 = [lebas_C3,lebas_H3,lebas_O3,lebas_MeEs_O3,lebas_EtEs_O3,lebas_HiEs_O3,lebas_Ac_O3,lebas_tospn_O3,lebas_dbl_N3,lebas_pri_N3,lebas_sec_N3,lebas_Br3,lebas_Cl3,lebas_F3,lebas_I3,lebas_S3,lebas_ringThr3,lebas_ringFo3,lebas_ringFi3,lebas_ringSi3,lebas_nphth3,lebas_anthr3];
      var lebas_Array4 = [lebas_C4,lebas_H4,lebas_O4,lebas_MeEs_O4,lebas_EtEs_O4,lebas_HiEs_O4,lebas_Ac_O4,lebas_tospn_O4,lebas_dbl_N4,lebas_pri_N4,lebas_sec_N4,lebas_Br4,lebas_Cl4,lebas_F4,lebas_I4,lebas_S4,lebas_ringThr4,lebas_ringFo4,lebas_ringFi4,lebas_ringSi4,lebas_nphth4,lebas_anthr4];
      var lebas_Array5 = [lebas_C5,lebas_H5,lebas_O5,lebas_MeEs_O5,lebas_EtEs_O5,lebas_HiEs_O5,lebas_Ac_O5,lebas_tospn_O5,lebas_dbl_N5,lebas_pri_N5,lebas_sec_N5,lebas_Br5,lebas_Cl5,lebas_F5,lebas_I5,lebas_S5,lebas_ringThr5,lebas_ringFo5,lebas_ringFi5,lebas_ringSi5,lebas_nphth5,lebas_anthr5];

      lebas_Array1 = replaceNaN(lebas_Array1);
      lebas_Array2 = replaceNaN(lebas_Array2);
      lebas_Array3 = replaceNaN(lebas_Array3);
      lebas_Array4 = replaceNaN(lebas_Array4);
      lebas_Array5 = replaceNaN(lebas_Array5);

      var lebas_Array1_mw = lebas_Array1.slice(0,-6); //
      var lebas_Array2_mw = lebas_Array2.slice(0,-6);
      var lebas_Array3_mw = lebas_Array3.slice(0,-6);
      var lebas_Array4_mw = lebas_Array4.slice(0,-6);
      var lebas_Array5_mw = lebas_Array5.slice(0,-6);

      catscope.lebas_Array1 = lebas_Array1;
      catscope.lebas_Array2 = lebas_Array2;
      catscope.lebas_Array3 = lebas_Array3;
      catscope.lebas_Array4 = lebas_Array4;
      catscope.lebas_Array5 = lebas_Array5;

      catscope.lebas_Array1_mw = lebas_Array1_mw;
      catscope.lebas_Array2_mw = lebas_Array2_mw;
      catscope.lebas_Array3_mw = lebas_Array3_mw;
      catscope.lebas_Array4_mw = lebas_Array4_mw;
      catscope.lebas_Array5_mw = lebas_Array5_mw;

      var lebas_MW_array = [12.011,1.008,15.999,15.999,15.999,15.999,15.999,15.999,14.007,14.007,14.007,79.904,35.453,18.998,126.905,32.066]; //has duplicate entries that match with duplicates in array
      catscope.lebas_MW_array = lebas_MW_array;

      var lebas_molarvb_array = [14.8,3.7,7.4,9.1,9.9,11,12,8.3,15.6,10.5,12,27,24.6,8.7,37,25.6,-6.0,-8.5,-11.5,-15.0,-30.0,-47.5]; //has all entries for all molar volume contributions
      catscope.lebas_molarvb_array = lebas_molarvb_array;

      var lebas_molweight1 = math.eval('lebas_Array1_mw*transpose(lebas_MW_array)',catscope); //calculate molecular weight of "1" by multiplying against MW_array^T
      var lebas_molweight2 = math.eval('lebas_Array2_mw*transpose(lebas_MW_array)',catscope); //units are g/mpl for all of these
      var lebas_molweight3 = math.eval('lebas_Array3_mw*transpose(lebas_MW_array)',catscope);
      var lebas_molweight4 = math.eval('lebas_Array4_mw*transpose(lebas_MW_array)',catscope);
      var lebas_molweight5 = math.eval('lebas_Array5_mw*transpose(lebas_MW_array)',catscope);

      var lebas_vb1 = math.eval('lebas_Array1*transpose(lebas_molarvb_array)',catscope); //calculate molar volume @ boiling of "1" by multiplying against the molar volume array^T
      var lebas_vb2 = math.eval('lebas_Array2*transpose(lebas_molarvb_array)',catscope); //units are cm^3 per mol for all of these
      var lebas_vb3 = math.eval('lebas_Array3*transpose(lebas_molarvb_array)',catscope);
      var lebas_vb4 = math.eval('lebas_Array4*transpose(lebas_molarvb_array)',catscope);
      var lebas_vb5 = math.eval('lebas_Array5*transpose(lebas_molarvb_array)',catscope);

      //add only lebas_vb1 to catscope to be used later
      catscope.lebas_vb1 = lebas_vb1;

      var lebas_molformula1 = lebasArrayToFormula(catscope.lebas_Array1_mw); //convert array of numbers into formula string
      var lebas_molformula2 = lebasArrayToFormula(catscope.lebas_Array2_mw);
      var lebas_molformula3 = lebasArrayToFormula(catscope.lebas_Array3_mw);
      var lebas_molformula4 = lebasArrayToFormula(catscope.lebas_Array4_mw);
      var lebas_molformula5 = lebasArrayToFormula(catscope.lebas_Array5_mw);

      var lebas_molweight_Array = [lebas_molweight1,lebas_molweight2,lebas_molweight3,lebas_molweight4,lebas_molweight5];
      var lebas_vb_Array = [lebas_vb1,lebas_vb2,lebas_vb3,lebas_vb4,lebas_vb5];
      var fuller_molformula_Array = [lebas_molformula1,lebas_molformula2,lebas_molformula3,lebas_molformula4,lebas_molformula5];

      catscope.lebas_molweight_Array = lebas_molweight_Array;
      catscope.lebas_vb_Array = lebas_vb_Array;
      catscope.fuller_molformula_Array = fuller_molformula_Array;

      var outputVbNames = ["#molar_boil_vol1","#molar_boil_vol2","#molar_boil_vol3","#molar_boil_vol4","#molar_boil_vol5"];
      var outputVbNames_popup = ["#lebas_vb1","#lebas_vb2","#lebas_vb3","#lebas_vb4","#lebas_vb5"];
      var outputMWNames = ["#molweight1","#molweight2","#molweight3","#molweight4","#molweight5"];
      var outputMWNames_popup = ["#lebas_molweight1","#lebas_molweight2","#lebas_molweight3","#lebas_molweight4","#lebas_molweight5"];
      var outputformulaNames= ["#lebas_molformula1","#lebas_molformula2","#lebas_molformula3","#lebas_molformula4","#lebas_molformula5"];

  if(catscope.dr_reaction_phase == "Liquid Phase") {//check if the selected phase is correct to perform these calculations

      for (i in catscope.molWeightArray) {
        if (catscope.lebas_molweight_Array[i] > 0) {
          catscope.molWeightArray[i] = catscope.lebas_molweight_Array[i];
        } else {
          //do nothing
        }
      }

      for (i in catscope.molar_boil_vol_Array) {
        if (catscope.lebas_vb_Array[i] > 0) {
          catscope.molar_boil_vol_Array[i] = catscope.lebas_vb_Array[i];
        } else {
          //do nothing
        }
      }


      $.each(catscope.lebas_vb_Array, function(index,value){//output results of formula, Mol. weight, and molar volume @ T_b
        writeOut(outputformulaNames[index],fuller_molformula_Array[index])
        if (lebas_molweight_Array[index] != 0 && lebas_vb_Array[index] != 0) { //ONLY write the values if they are NOT zero
          writeOut(outputMWNames[index],lebas_molweight_Array[index])
          writeOut(outputMWNames_popup[index],lebas_molweight_Array[index])
          writeOut(outputVbNames[index],lebas_vb_Array[index])
          writeOut(outputVbNames_popup[index],lebas_vb_Array[index])
        }
      });
    } /*else if(catscope.dr_reaction_phase == "Trickle Bed(Gas-Liquid)"){
      for (i in catscope.molWeightArray) {
        if (catscope.lebas_molweight_Array[i] > 0) {
          catscope.molWeightArray[i] = catscope.lebas_molweight_Array[i];
        } else {
          //do nothing
        }
      }

      for (i in catscope.molar_boil_vol_Array) {
        if (catscope.lebas_vb_Array[i] > 0) {
          catscope.molar_boil_vol_Array[i] = catscope.lebas_vb_Array[i];
        } else {
          //do nothing
        }
      }


      $.each(catscope.lebas_vb_Array, function(index,value){//output results of formula, Mol. weight, and molar volume @ T_b
        writeOut(outputformulaNames[index],fuller_molformula_Array[index])
        if (lebas_molweight_Array[index] != 0 && lebas_vb_Array[index] != 0) { //ONLY write the values if they are NOT zero
          writeOut(outputMWNames_popup[index],lebas_molweight_Array[index])
          writeOut(outputVbNames[index],lebas_vb_Array[index])
          writeOut(outputVbNames_popup[index],lebas_vb_Array[index])
        }
      });
    }*/
  });

  //////////////////////////////////////////////////////////////////////////////////
  //mixture diffusivity, molecule radius, pore constriction factor for liquids
  $("#temp,#pressure,#molweight3").on('keyup keydown change', function (){
    if(catscope.dr_reaction_phase == "Liquid Phase") { //check if the selected phase is correct to perform these calculations
      var diff_mixture_out = "#diff_mixture"; //output in m^2/s

      //dont need association factor for component 1 with itself
      var wilke_assoc_phi2 = $("#wilke_assoc_phi2").val().toNum();
      var wilke_assoc_phi3 = $("#wilke_assoc_phi3").val().toNum();
      var wilke_assoc_phi4 = $("#wilke_assoc_phi4").val().toNum();
      var wilke_assoc_phi5 = $("#wilke_assoc_phi5").val().toNum();

      catscope.wilke_assoc_phi2 = wilke_assoc_phi2;
      catscope.wilke_assoc_phi3 = wilke_assoc_phi3;
      catscope.wilke_assoc_phi4 = wilke_assoc_phi4;
      catscope.wilke_assoc_phi5 = wilke_assoc_phi5;

      catscope.wilke_assoc_Array = [catscope.wilke_assoc_phi2,catscope.wilke_assoc_phi3,catscope.wilke_assoc_phi4,catscope.wilke_assoc_phi5];
      catscope.wilke_assoc_Array = replaceNaN(catscope.wilke_assoc_Array); //replace NaN with zeros

      catscope.molFracArray_no_A = $.extend( true, [], catscope.molFracArray); //duplicate existing object
      catscope.molFracArray_no_A.shift() //remove first element 'A'

      catscope.molWeightArray_no_A = $.extend( true, [], catscope.molWeightArray);
      catscope.molWeightArray_no_A.shift() //remove first element 'A'

      var perkins_phi_M = math.eval('(1/(1-molfrac1))*sum(molFracArray_no_A.*wilke_assoc_Array.*molWeightArray_no_A)',catscope); //just manually specifying equation for clarity
      catscope.perkins_phi_M = perkins_phi_M;

      catscope.avg_viscosity_nonSI = math.eval('avg_viscosity*1000',catscope); //convert from kg/m/s to centipoise

      var diff_mixture_nonSI = math.eval('7.4e-8*perkins_phi_M^0.5*temp/avg_viscosity_nonSI/molar_boil_vol1^0.6',catscope); //hardcoded to component 1
      catscope.diff_mixture_nonSI = diff_mixture_nonSI;
      catscope.diff_mixture = math.eval('diff_mixture_nonSI/1e4',catscope); //convert from cm^2/s to m^2/s

      var molecule_radius1 = math.eval('1e8*(molar_boil_vol1/6.022e23*3/4/pi)^(1/3)',catscope); //output units are in Angstroms, (molar_boil_vol1 is cm^3/mol)
      catscope.molecule_radius1 = molecule_radius1;

      var pore_constriction_factor = math.eval('10^(-2*molecule_radius1/cat_pore_radius)',catscope); //used later for effective diffusivity calculation
      catscope.pore_constriction_factor = pore_constriction_factor;

      if (catscope.molTest == true) { //check if mol fractions add to 1 or not
        if (catscope.molfrac1 == 1) {
          writeOut(diff_mixture_out,'Mol Frac. of A = 1');
        } else {

          writeOut(diff_mixture_out,catscope.diff_mixture);
        }
      } else {
        writeOut(diff_mixture_out,'Sum of Mol Frac. not 1');
      }

    } else {
      //do nothing
    }
  });

  //////////////////////////////////////////////////////////////////////////////////
  //thermal conductivity mixing function for liquids
  $("#temp,#pressure,#molweight3").on('keyup keydown change', function (){
    if(catscope.dr_reaction_phase == "Liquid Phase") { //check if the selected phase is correct to perform these calculations

    }

  });


  //////////////////////////////////////////////////////////////////////////////////
  //ideal gas density for all five possible components
  $("#molweight1,#molweight2,#molweight3,#molweight4,#molweight5,#temp,#pressure").on('keyup keydown change', function (){
    //id string of output field
    var res_gasdens1_out = "#res_gasdens1"; //output in kg per m^3
    var res_gasdens2_out = "#res_gasdens2"; //output in kg per m^3
    var res_gasdens3_out = "#res_gasdens3"; //output in kg per m^3
    var res_gasdens4_out = "#res_gasdens4"; //output in kg per m^3
    var res_gasdens5_out = "#res_gasdens5"; //output in kg per m^3

    //perform calculation
    var res_gasdens1 = idealGasDensity(catscope.molweight1,catscope.temp,catscope.pressure);
    var res_gasdens2 = idealGasDensity(catscope.molweight2,catscope.temp,catscope.pressure);
    var res_gasdens3 = idealGasDensity(catscope.molweight3,catscope.temp,catscope.pressure);
    var res_gasdens4 = idealGasDensity(catscope.molweight4,catscope.temp,catscope.pressure);
    var res_gasdens5 = idealGasDensity(catscope.molweight5,catscope.temp,catscope.pressure);

    //add result to scope
    catscope.res_gasdens1 = res_gasdens1;
    catscope.res_gasdens2 = res_gasdens2;
    catscope.res_gasdens3 = res_gasdens3;
    catscope.res_gasdens4 = res_gasdens4;
    catscope.res_gasdens5 = res_gasdens5;

    //actually write to the appropriate field
    writeOut(res_gasdens1_out,res_gasdens1);
    writeOut(res_gasdens2_out,res_gasdens2);
    writeOut(res_gasdens3_out,res_gasdens3);
    writeOut(res_gasdens4_out,res_gasdens4);
    writeOut(res_gasdens5_out,res_gasdens5);
  });

  //////////////////////////////////////////////////////////////////////////////////
  //function for average GAS/LIQUID density and average molecular weight
  $("#molweight3,#temp,#pressure").on('keyup keydown change', function (){
    //id string of output field
    var avg_density_out = "#avg_density"; //output in kg per m^3
    var avg_mw_out = "#avg_mw";

    if (catscope.molTest == 1) { //logical test for if mol fractions add to one
      var avg_mw = molFracMixingFunction(catscope.molFracArray,catscope.molWeightArray);
      catscope.avg_mw = avg_mw;

      //actually write the results to the appropriate fields
      writeOut(avg_mw_out,avg_mw);

      if (catscope.dr_reaction_phase == "Gas Phase") {
        var avg_density = idealGasDensity(catscope.avg_mw,catscope.temp,catscope.pressure);
        catscope.avg_density = avg_density;

        //actually write the results to the appropriate fields
        writeOut(avg_density_out,avg_density);

      } else if (catscope.dr_reaction_phase == "Liquid Phase") {
        var density_denominator = math.eval('molFracArray.*molWeightArray./liqDensityArray',catscope); //this will generate NaN values in cases without all 5 components specified
        density_denominator = replaceNaN(density_denominator);//this repalces NaN values in this array with Zeros
        var density_numerator = math.eval('molFracArray*transpose(molWeightArray)',catscope);

        var avg_density = math.divide(density_numerator,math.sum(density_denominator));
        catscope.avg_density = avg_density;

        //actually write the results to the appropriate fields
        writeOut(avg_density_out,avg_density);
      }
    } else {
      writeOut(avg_density_out,'Sum of Mol Frac. not 1');
      writeOut(avg_mw_out,'Sum of Mol Frac. not 1');
    }
  });

  //////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////
  /// from now on NOT going to mess with change triggers -- the ones above were altered
  //////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////


  //////////////////////////////////////////////////////////////////////////////
  // function for external surface area, bed tortuosity, Peclet_f from Gunn et. al., Peclet_r_inf, and Schlunder_C
  $("#R_p,#L_p,#R_p_inner,#dr_cat_shape,.initialize").on('keyup keydown change', function (){
    //id string of output field
    var cat_ext_area_out = "#cat_ext_area";
    var cat_particle_vol_out = "#cat_particle_vol";

    var cat_ext_area;
    var cat_particle_vol;
    var bed_tortuosity;
    var ndim_peclet_f;
    var ndim_peclet_r_inf;
    var schlunder_C;


    if (catscope.dr_cat_shape == "Spheres"){
      cat_ext_area = math.eval('4*pi*R_p^2',catscope);
      cat_particle_vol = math.eval('4/3*pi*R_p^3',catscope);
      bed_tortuosity = 1.4;
      ndim_peclet_f = math.eval('40 - 29*exp(-7/ndim_reynolds)',catscope);
      ndim_peclet_r_inf = 10;
      schlunder_C = 1.25;
      ndim_biot_solid = math.eval('2.41 + 0.156*(R_rctr/cat_effective_radius_volequiv - 1)^2',catscope);
    } else if (catscope.dr_cat_shape == "Cylinders"){
      cat_ext_area = math.eval('2*pi*R_p*(L_p + R_p)',catscope);
      cat_particle_vol = math.eval('pi*R_p^2*L_p',catscope);
      bed_tortuosity = 1.93;
      ndim_peclet_f = math.eval('11 - 4*exp(-7/ndim_reynolds)',catscope);
      ndim_peclet_r_inf = 7;
      schlunder_C = 2.5;
      ndim_biot_solid = math.eval('0.48 + 0.192*(R_rctr/cat_effective_radius_volequiv - 1)^2',catscope);
    } else if (catscope.dr_cat_shape == "Rings"){
      bed_tortuosity = 1.8;
      ndim_peclet_f = math.eval('9 - 3.3*exp(-7/ndim_reynolds)',catscope);
      ndim_peclet_r_inf = 6;
      schlunder_C = math.eval('2.5*(1 + (R_p_inner/R_p)^2)',catscope);
      ndim_biot_solid = math.eval('0.48 + 0.192*(R_rctr/cat_effective_radius_volequiv - 1)^2',catscope);
      if (catscope.R_p_inner < catscope.R_p) { //check if inner radius < outer radius for rings
        cat_ext_area = math.eval('2*pi*((R_p + R_p_inner)*L_p + (R_p^2 - R_p_inner^2))',catscope);
        cat_particle_vol = math.eval('pi*(R_p^2 - R_p_inner^2)*L_p',catscope);
      } else if (catscope.R_p_inner >= catscope.R_p){
        // inner radius greater than outer radius doesn't make any sense
        cat_ext_area = 0;
        cat_particle_vol = 0;
      } else {
        //do nothing
      }
    }

    catscope.cat_ext_area = cat_ext_area;
    catscope.bed_tortuosity = bed_tortuosity;
    catscope.ndim_peclet_f = ndim_peclet_f;
    catscope.cat_particle_vol = cat_particle_vol;
    catscope.ndim_peclet_r_inf = ndim_peclet_r_inf;
    catscope.schlunder_C = schlunder_C;
    catscope.ndim_biot_solid = ndim_biot_solid;

    //actually write the results to the appropriate fields
    writeOut(cat_ext_area_out,cat_ext_area);
    writeOut(cat_particle_vol_out,cat_particle_vol);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for three types of effective radii
  $("#R_p,#L_p,#R_p_inner,#cat_ext_area").on('keyup keydown change', function (){

    //perform calculations
    var cat_effective_radius = math.eval('sqrt(cat_ext_area/pi)/2',catscope) //applies to all particle shapes
    var cat_effective_radius_ergun = math.eval('3*cat_particle_vol/cat_ext_area',catscope); //applies to all shapes
    var cat_effective_radius_volequiv = math.eval('(3/4/pi*cat_particle_vol)^(1/3)',catscope); //applies to all shapes

    //put result in catscope
    catscope.cat_effective_radius = cat_effective_radius;
    catscope.cat_effective_radius_ergun = cat_effective_radius_ergun;
    catscope.cat_effective_radius_volequiv = cat_effective_radius_volequiv;
  });


  //////////////////////////////////////////////////////////////////////////////
  // function for particle density
  $("#cat_rho_bulk,#cat_void_frac").on('keyup keydown change', function (){
    //id string of output field
    var cat_rho_particle_out = "#cat_rho_particle";

    //perform calculation
    var cat_rho_particle = math.eval('cat_rho_bulk/(1 - cat_void_frac)',catscope);
    catscope.cat_rho_particle = cat_rho_particle;

    //actually write the results to the appropriate fields
    writeOut(cat_rho_particle_out,cat_rho_particle);//g per cm^3
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for porosity
  $("#cat_rho_particle,#cat_pore_volume,#cat_rho_bulk,#cat_void_frac").on('keyup keydown change', function (){
    //id string of output field
    var cat_porosity_out = "#cat_porosity";

    //perform calculation
    var cat_porosity = math.eval('cat_pore_volume_SI*cat_rho_particle',catscope);

    //add result to catscope
    catscope.cat_porosity = cat_porosity;

    //actually write the results to the appropriate fields
    writeOut(cat_porosity_out,cat_porosity);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for pore radius
  $("#cat_pore_volume,#cat_surf_area").on('keyup keydown change', function (){
    //id string of output field
    var cat_pore_radius_out = "#cat_pore_radius";

    //perform calculation
    var cat_pore_radius = math.eval('1e10*2*cat_pore_volume/cat_surf_area',catscope)//angstroms
    catscope.cat_pore_radius = cat_pore_radius;
    var cat_pore_radius_SI = math.eval('cat_pore_radius/1e10',catscope)//meters

    //add result to catscope
    catscope.cat_pore_radius_SI = cat_pore_radius_SI;

    //actually write the results to the appropriate fields
    writeOut(cat_pore_radius_out,cat_pore_radius); //angstroms
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for limiting reactant check
  $("#temp,#pressure").on('keyup keydown change', function (){
    if ($('#dr_num_reactants').val() == "Two") {
      //id string of output field
      var limiting_reactant_check_out = "#limiting_reactant_check";

      //perform calculation
      var limiting_reactant_check_LHS = math.eval('molfrac1/molfrac2',catscope);
      var limiting_reactant_check_RHS = math.eval('1/rxn_conversion1',catscope);

      //add to catscope
      catscope.limiting_reactant_check_LHS = limiting_reactant_check_LHS;
      catscope.limiting_reactant_check_RHS = limiting_reactant_check_RHS;

      var test_result = ["no","yes"];


      if (catscope.limiting_reactant_check_LHS <= catscope.limiting_reactant_check_RHS) {
        writeOut(limiting_reactant_check_out,test_result[1]);
        $('#limiting_reactant_check').prop("class","clcd-green");
      } else if (catscope.limiting_reactant_check_LHS > catscope.limiting_reactant_check_RHS) {
        writeOut(limiting_reactant_check_out,test_result[0]);
        $('#limiting_reactant_check').prop("class","clcd-red");
      } else {
        writeOut(limiting_reactant_check_out,'Undefined');
        $('#limiting_reactant_check').prop("class","");
      }

    } else {
      //do nothing
    }
  });



  //////////////////////////////////////////////////////////////////////////////
  // function for mixture thermal conductivity for both gases and liquids
  $("#thermalcond1,#thermalcond2,#molweight1,#molweight2,#molfrac1,#molfrac2").on('keyup keydown change', function (){
    //id string of output field
    var avg_k_conduct_out = "#avg_k_conduct"; //output in kg per m^3

    //intermediate variables
    var kfArray = [catscope.thermalcond1,catscope.thermalcond2,catscope.thermalcond3,catscope.thermalcond4,catscope.thermalcond5];

    //add above to catscope
    catscope.kfArray = kfArray;


    if (catscope.molTest == 1) { //logical test for if mol fractions add to one
        if (catscope.dr_reaction_phase == "Gas Phase") { //GAS phase avg thermal conductivity
          var mwArrayInvThird = math.dotPow(catscope.molWeightArray,1/3) //could convert to math.eval calculation
          var denom = math.multiply(catscope.molFracArray,mwArrayInvThird);
          var numer = math.multiply(math.dotMultiply(catscope.molFracArray,mwArrayInvThird),catscope.kfArray)
          var avg_k_conduct = math.divide(numer,denom);

          //add to catscope
          catscope.avg_k_conduct = avg_k_conduct;

          //actually write the result to the appropriate field
          writeOut(avg_k_conduct_out,avg_k_conduct);
        } else if (catscope.dr_reaction_phase == "Liquid Phase") { //LIQUID phase avg thermal conductivity
          var molar_density_Array = math.eval('liqDensityArray./molWeightArray',catscope); //kmol per m^3 -- units dont matter too much
          molar_density_Array = replaceInfwZero(molar_density_Array);
          catscope.molar_density_Array = molar_density_Array;

          var phiHat_Array_denom = math.eval('sum(molFracArray./molar_density_Array)',catscope);
          catscope.phiHat_Array_denom = phiHat_Array_denom;

          var phiHat_Array = math.eval('(molFracArray./molar_density_Array)/phiHat_Array_denom',catscope); //unitless 'volume fraction'
          catscope.phiHat_Array = phiHat_Array;

          var avg_k_conduct = li_kf_MixingFunction(catscope);
          catscope.avg_k_conduct = avg_k_conduct

          writeOut(avg_k_conduct_out,avg_k_conduct);
        }
    } else {
      writeOut(avg_k_conduct_out,'Sum of Mol Frac. not 1');
    }

  });

  //////////////////////////////////////////////////////////////////////////////
  // function for mixture viscosity
  $("#fluidvisc1,#fluidvisc2,#molweight1,#molweight2,#molfrac1,#molfrac2").on('keyup keydown change', function (){
    //id string of output field
    var avg_viscosity_out = "#avg_viscosity"; //output in kg per m^3

    //intermediate variables
    var viscArray = [catscope.fluidvisc1,catscope.fluidvisc2,catscope.fluidvisc3,catscope.fluidvisc4,catscope.fluidvisc5];

    //add above to catscope
    catscope.viscArray = viscArray;

    if (catscope.molTest == 1) { //logical test for if mol fractions add to one
        if (catscope.dr_reaction_phase == "Gas Phase") {
          var mwArrayInvHalf = math.dotPow(catscope.molWeightArray,0.5) //could convert to math.eval calculation
          var denom = math.multiply(catscope.molFracArray,mwArrayInvHalf);
          var numer = math.multiply(math.dotMultiply(catscope.molFracArray,mwArrayInvHalf),catscope.viscArray)
          var avg_viscosity = math.divide(numer,denom);

          //add to catscope
          catscope.avg_viscosity = avg_viscosity;

          //actually write the result to the appropriate field
          writeOut(avg_viscosity_out,avg_viscosity);
        } else if (catscope.dr_reaction_phase == "Liquid Phase") {
          var avg_viscosity = math.eval('sum(molFracArray.*(viscArray.^(1/3)))^3',catscope);

          //add to catscope
          catscope.avg_viscosity = avg_viscosity;

          //actually write the result to the appropriate field
          writeOut(avg_viscosity_out,avg_viscosity);
        }
    } else {
      writeOut(avg_viscosity_out,'Sum of Mol Frac. not 1');
    }
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for mass of catalyst and bed volume
  $("#cat_rho_bulk,#R_rctr").on('keyup keydown change', function (){
    //id string of output field
    var bed_volume_out = "#bed_volume";
    var mass_catalyst_out = "#mass_catalyst"; //output in kg per m^2 per s

    //perform calculation
    var bed_volume = math.eval('pi*R_rctr^2*L_bed',catscope);
    catscope.bed_volume = bed_volume;

    var mass_catalyst = math.eval('cat_rho_bulk*bed_volume',catscope);
    catscope.mass_catalyst = mass_catalyst;

    //actually write the data to the appropriate cell
    writeOut(bed_volume_out,bed_volume);
    writeOut(mass_catalyst_out,mass_catalyst);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for feed (mass) flowrate and feed (molar) flowrate of 'A'
  $("#mass_flowrate,#R_rctr,#avg_density").on('keyup keydown change', function (){
    //id string of output field
    var mass_flowrate_out = "#mass_flowrate"; //output in kg per s

    //perform calculation
    var mass_flowrate = math.eval('rxn_rate*mass_catalyst*avg_mw/1000/rxn_conversion1/molfrac1',catscope)
    catscope.mass_flowrate = mass_flowrate;

    var molar_flowrate1 = math.eval('rxn_rate*mass_catalyst/rxn_conversion1',catscope); //molar flowrate of 'A'
    catscope.molar_flowrate1 = molar_flowrate1;

    var volumetric_flowrate = math.eval('mass_flowrate/avg_density',catscope); //units of m^3/s
    catscope.volumetric_flowrate = volumetric_flowrate;

    //actually write the data to the appropriate cell
    writeOut(mass_flowrate_out,mass_flowrate);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for superficial mass flux
  $("#mass_flowrate,#R_rctr").on('keyup keydown change', function (){
    //id string of output field
    var superf_mass_flux_out = "#superf_mass_flux"; //output in kg per m^2 per s

    //perform calculation
    var superf_mass_flux = math.eval('mass_flowrate/(pi*R_rctr^2)',catscope);
    catscope.superf_mass_flux = superf_mass_flux;

    //actually write the data to the appropriate cell
    writeOut(superf_mass_flux_out,superf_mass_flux);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for Bulk Concentration of Main Reactant 'A'
  $("#molfrac1,#avg_density,#avg_mw").on('keyup keydown change', function (){
    //id string of output field
    var res_bulkconc1_out = "#res_bulkconc1"; //unitless

    //perform calculation
    var avg_mw_SI = math.divide(catscope.avg_mw,1000); //kg per mol
    catscope.avg_mw_SI = avg_mw_SI;

    var res_bulkconc1 = math.eval('molfrac1*avg_density/avg_mw_SI',catscope)//mol per m^3
    catscope.res_bulkconc1 = res_bulkconc1;

    //actually write the data to the appropriate cell
    writeOut(res_bulkconc1_out,res_bulkconc1);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for interfacial area heat and mass transfer
  $("#cat_ext_area,#cat_rho_particle,#cat_particle_vol").on('keyup keydown change', function (){
    //id string of output field
    var cat_interfacial_area_out = "#cat_interfacial_area";

    //perform calculations
    var cat_interfacial_area = math.eval('cat_ext_area/cat_rho_particle/cat_particle_vol',catscope);
    catscope.cat_interfacial_area = cat_interfacial_area;

    //actually write the data to the appropriate cell
    writeOut(cat_interfacial_area_out,cat_interfacial_area);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for Prandtl Number
  $("#avg_cp,#avg_viscosity,#avg_k_conduct,#avg_mw").on('keyup keydown change', function (){
    //id string of output field
    var ndim_prandtl_out = "#ndim_prandtl"; //unitless

    //perform calculation
    var ndim_prandtl = math.eval('avg_cp*avg_viscosity/avg_k_conduct',catscope);
    catscope.ndim_prandtl = ndim_prandtl;

    //actually write the data to the appropriate cell
    writeOut(ndim_prandtl_out,ndim_prandtl);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for Schmidt Number
  $("#avg_density,#avg_viscosity,#diff_mixture").on('keyup keydown change', function (){
    //id string of output field
    var ndim_schmidt_out = "#ndim_schmidt"; //unitless

    //perform calculation
    var ndim_schmidt = math.eval('avg_viscosity/avg_density/diff_mixture',catscope);
    catscope.ndim_schmidt = ndim_schmidt;

    //actually write the data to the appropriate cell
    writeOut(ndim_schmidt_out,ndim_schmidt);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for Reynolds Number
  $("#superf_mass_flux,#avg_viscosity,#cat_effective_radius").on('keyup keydown change', function (){
    //id string of output field
    var ndim_reynolds_out = "#ndim_reynolds"; //unitless

    //perform calculation
    var ndim_reynolds = math.eval('2*superf_mass_flux*cat_effective_radius/avg_viscosity',catscope)
    catscope.ndim_reynolds = ndim_reynolds;

    //actually write the data to the appropriate cell
    writeOut(ndim_reynolds_out,ndim_reynolds);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for mass transfer between particles and fluid, k_m, j_D (Chilton-Colburn), and boundary layer thickness
  $("#ndim_reynolds,#superf_mass_flux,#avg_density,#cat_void_frac,#ndim_schmidt").on('keyup keydown change', function (){
    //id string of output field
    var ndim_colburn_out = "#ndim_colburn"; //unitless
    var ndim_massXfer_coeff_out = "#ndim_massXfer_coeff"; //unitless

    //perform calculations

    if (catscope.dr_reaction_phase == "Gas Phase") { //first check gas phase vs. liquid phase
      if (math.ceil(catscope.ndim_reynolds) >= 10 && catscope.cat_void_frac > 0.25 && catscope.cat_void_frac < 0.95){
        var ndim_colburn = math.eval('(0.765/ndim_reynolds^0.82 + 0.365/ndim_reynolds^0.386)/cat_void_frac',catscope); //correlation from Dwivedi and Upadhyay 1977
        catscope.ndim_colburn = ndim_colburn;
        var ndim_massXfer_coeff = math.eval('ndim_colburn*superf_mass_flux/avg_density/ndim_schmidt^(2/3)',catscope);
        catscope.ndim_massXfer_coeff = ndim_massXfer_coeff;
        $('#ndim_colburn').prop("class","");
        $('#ndim_massXfer_coeff').prop("class","");
        //actually write the data to the appropriate cell
        writeOut(ndim_colburn_out,ndim_colburn);
        writeOut(ndim_massXfer_coeff_out,ndim_massXfer_coeff);
      } else if (math.ceil(catscope.ndim_reynolds) < 10) {
        writeOut(ndim_colburn_out,"Reynolds # is too low");
        writeOut(ndim_massXfer_coeff_out,"Error");
        $('#ndim_colburn').prop("class","clcd-red");
        $('#ndim_massXfer_coeff').prop("class","clcd-red");
      }
    } else if (catscope.dr_reaction_phase == "Liquid Phase") {
      if (catscope.ndim_reynolds > 0.01 && catscope.cat_void_frac > 0.25 && catscope.cat_void_frac < 0.95){
        var ndim_colburn = math.eval('(0.765/ndim_reynolds^0.82 + 0.365/ndim_reynolds^0.386)/cat_void_frac',catscope);
        catscope.ndim_colburn = ndim_colburn;
        var ndim_massXfer_coeff = math.eval('ndim_colburn*superf_mass_flux/avg_density/ndim_schmidt^(2/3)',catscope);
        catscope.ndim_massXfer_coeff = ndim_massXfer_coeff;
        $('#ndim_colburn').prop("class","");
        $('#ndim_massXfer_coeff').prop("class","");
        //actually write the data to the appropriate cell
        writeOut(ndim_colburn_out,ndim_colburn);
        writeOut(ndim_massXfer_coeff_out,ndim_massXfer_coeff);
      } else if (catscope.ndim_reynolds < 0.01) {
        writeOut(ndim_colburn_out,"Reynolds # is too low");
        writeOut(ndim_massXfer_coeff_out,"Error");
        $('#ndim_colburn').prop("class","clcd-red");
        $('#ndim_massXfer_coeff').prop("class","clcd-red");
      }
    }



    var ndim_BL_thickness = math.eval('diff_mixture/ndim_massXfer_coeff/aris_L',catscope);
    catscope.ndim_BL_thickness = ndim_BL_thickness;
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for Sherwood Number
  $("#ndim_massXfer_coeff,#cat_effective_radius,#diff_mixture").on('keyup keydown change', function (){
    //id string of output field
    var ndim_sherwood_out = "#ndim_sherwood"; //unitless

    //perform calculations
    var ndim_sherwood = math.eval('2*ndim_massXfer_coeff*cat_effective_radius/diff_mixture',catscope);
    catscope.ndim_sherwood = ndim_sherwood;

    //actually write the data to the appropriate cell
    writeOut(ndim_sherwood_out,ndim_sherwood);
  });


  //////////////////////////////////////////////////////////////////////////////
  // function for particle-fluid heat transfer coefficient (Chilton-Colburn analogy)
  $("#ndim_colburn,#avg_cp,#superf_mass_flux,#ndim_prandtl").on('keyup keydown change', function (){
    //id string of output field
    var ndim_heatXfer_coeff_out = "#ndim_heatXfer_coeff";

    //perform calculations
    var ndim_heatXfer_coeff = math.eval('ndim_colburn*avg_cp*superf_mass_flux/(ndim_prandtl^(2/3))',catscope);
    catscope.ndim_heatXfer_coeff = ndim_heatXfer_coeff;

    //actually write the data to the appropriate cell
    writeOut(ndim_heatXfer_coeff_out,ndim_heatXfer_coeff);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for Nusselt number
  $("#ndim_heatXfer_coeff,#cat_effective_radius,#avg_k_conduct").on('keyup keydown change', function (){
    //id string of output field
    var ndim_nusselt_out = "#ndim_nusselt";

    //perform calculations
    var ndim_nusselt = math.eval('2*ndim_heatXfer_coeff*cat_effective_radius/avg_k_conduct',catscope);
    catscope.ndim_nusselt = ndim_nusselt;

    //actually write the data to the appropriate cell
    writeOut(ndim_nusselt_out,ndim_nusselt);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for maximum possible fully diffusion limited rate
  $("#ndim_massXfer_coeff,#cat_interfacial_area,#res_bulkconc1,#ndim_reynolds").on('keyup keydown change', function (){
    //id string of output field
    var rxn_maxlimitingrate_out = "#rxn_maxlimitingrate"; //unitless

    //perform calculations
    var rxn_maxlimitingrate = math.eval('ndim_massXfer_coeff*cat_interfacial_area*res_bulkconc1',catscope);
    catscope.rxn_maxlimitingrate = rxn_maxlimitingrate;

    //actually write the data to the appropriate cell
    writeOut(rxn_maxlimitingrate_out,rxn_maxlimitingrate);
  });


  //////////////////////////////////////////////////////////////////////////////
  // function for mixture heat capacity
  $("#heatcapacity1,#heatcapacity2,#molfrac1,#molfrac2").on('keyup keydown change', function (){
    //id string of output field
    var avg_cp_out = "#avg_cp"; //output in J per kg per K

    //intermediate variables
    var cpArray = [catscope.heatcapacity1,catscope.heatcapacity2,catscope.heatcapacity3,catscope.heatcapacity4,catscope.heatcapacity5];
    catscope.cpArray = cpArray;

    if (catscope.molTest == 1) { //logical test for if mol fractions add to one
      var denom = math.eval('sum(molFracArray*transpose(molWeightArray))',catscope);
      var numerator = math.sum(math.dotMultiply(math.dotMultiply(catscope.molFracArray,catscope.molWeightArray),catscope.cpArray));
      var avg_cp = math.divide(numerator,denom);
      catscope.avg_cp = avg_cp;
      //actually write the result to the appropriate field
      writeOut(avg_cp_out,avg_cp);
    } else {
      writeOut(avg_cp_out,'Sum of Mol Frac. not 1');
    }
  });


  //////////////////////////////////////////////////////////////////////////////
  // function for Knudsen Diffusivity
  $("#cat_pore_radius,#avg_mw,#rxn_surftemperature,#rxn_surfconcentration").on('keyup keydown change', function (){
    //id string of output field
    var diff_knudsen_out = "#diff_knudsen"; //unitless

    var cat_pore_radius_cm = math.divide(catscope.cat_pore_radius,1e8);
    catscope.cat_pore_radius_cm = cat_pore_radius_cm;

    var max_mw = math.max(catscope.molWeightArray);
    catscope.max_mw = max_mw;

    catscope.itercount = math.sum(catscope.itercount,1);

    //perform calculations
    var diff_knudsen = math.eval('9700*cat_pore_radius_cm*(rxn_surftemperature/max_mw)^0.5/1e4',catscope); //m^2 per s
    catscope.diff_knudsen = diff_knudsen;
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for Effective Diffusivity -- separate for liquids vs. gases
  $("#cat_pore_tortuosity,#diff_mixture,#diff_knudsen,#temp,#rxn_surftemperature").on('keyup keydown change', function (){
    //id string of output field
    var diff_effective_out = "#diff_effective"; //unitless

    //perform calculations
    if (catscope.ck_override_diffusivity == true) { //check if the user has asked to override the effective diffusivity
      var diff_effective = catscope.diff_effective_override
      catscope.diff_effective = diff_effective;
    } else {
      if (catscope.dr_reaction_phase == "Gas Phase") {
        var diff_effective = math.eval('cat_porosity/cat_pore_tortuosity/((1/diff_mixture)*(temp/rxn_surftemperature)^1.75 + (1/diff_knudsen))',catscope);
        catscope.diff_effective = diff_effective;
      } else if (catscope.dr_reaction_phase == "Liquid Phase") {
        var diff_effective = math.eval('cat_porosity/cat_pore_tortuosity*pore_constriction_factor*diff_mixture*exp(-1608*(1/temp - 1/rxn_surftemperature))',catscope);
        catscope.diff_effective = diff_effective;
      }
    }
    //actually write the data to the appropriate cell
    writeOut(diff_effective_out,diff_effective);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for observed rate constant, inlet and outlet rates, and surface concentrations at the average, inlet and outlet
  $("#cat_pore_tortuosity,#diff_mixture,#diff_knudsen,#temp,#rxn_surfconcentration,#rxn_surftemperature,#rxn_externalconc_grad").on('keyup keydown change', function (){

    var rxn_externalconc_grad_out = "#rxn_externalconc_grad";

    if (catscope.dr_rxn_order == 0) { //look at the user reported reaction order to decide what equation to use
      var rxn_observed_rconst = math.eval('rxn_rate',catscope); //for zero order reactions k = r_obs with units of mol/kg-cat/s
      catscope.rxn_observed_rconst = rxn_observed_rconst;

      var rxn_avg_bulk_concentration1 = math.eval('res_bulkconc1*(1 - 0.5*rxn_conversion1)',catscope); //average occurs at 1/2*X due to linear concentration gradient
      catscope.rxn_avg_bulk_concentration1 = rxn_avg_bulk_concentration1;

      catscope.rxn_rate_inlet = catscope.rxn_observed_rconst;
      catscope.rxn_rate_outlet = catscope.rxn_observed_rconst;

      var rxn_bulkconc_outlet1 = math.eval('res_bulkconc1*(1-rxn_conversion1)',catscope);
      catscope.rxn_bulkconc_outlet1 = rxn_bulkconc_outlet1;

      var rxn_surfconcentration_inlet = math.eval('res_bulkconc1 - rxn_observed_rconst/ndim_massXfer_coeff/cat_interfacial_area',catscope);
      catscope.rxn_surfconcentration_inlet = rxn_surfconcentration_inlet;

      var rxn_surfconcentration_outlet = math.eval('res_bulkconc1*(1 - rxn_observed_rconst/volumetric_flowrate/res_bulkconc1*mass_catalyst) - rxn_observed_rconst/ndim_massXfer_coeff/cat_interfacial_area',catscope);
      catscope.rxn_surfconcentration_outlet = rxn_surfconcentration_outlet;

      //////////////////////
      var rxn_surfconcentration = math.eval('rxn_avg_bulk_concentration1 - (rxn_rate/ndim_massXfer_coeff/cat_interfacial_area)',catscope); //res_bulkconc1 is incorrect
      catscope.rxn_surfconcentration = rxn_surfconcentration;

    } else if (catscope.dr_rxn_order == 1) {
      //perform calculations
      var rxn_observed_rconst = math.eval('-volumetric_flowrate/mass_catalyst*(log(1-rxn_rate*mass_catalyst/res_bulkconc1/volumetric_flowrate))',catscope);
      catscope.rxn_observed_rconst = rxn_observed_rconst;

      var rxn_avg_bulk_concentration1 = math.eval('res_bulkconc1*volumetric_flowrate/rxn_observed_rconst/mass_catalyst*(1-exp(-rxn_observed_rconst/volumetric_flowrate*mass_catalyst))',catscope);
      catscope.rxn_avg_bulk_concentration1 = rxn_avg_bulk_concentration1;

      var rxn_rate_inlet = math.eval('rxn_observed_rconst*res_bulkconc1',catscope); //rate of reaction @ inlet in units of mol/kgcat/s
      catscope.rxn_rate_inlet = rxn_rate_inlet;

      var rxn_rate_outlet = math.eval('rxn_observed_rconst*res_bulkconc1*(1/exp(rxn_observed_rconst/volumetric_flowrate*mass_catalyst))',catscope);//rate of reaction @ outlet in units of mol/kgcat/s
      catscope.rxn_rate_outlet = rxn_rate_outlet;

      var rxn_bulkconc_outlet1 = math.eval('res_bulkconc1*(1-rxn_conversion1)',catscope);
      catscope.rxn_bulkconc_outlet1 = rxn_bulkconc_outlet1;

      var rxn_surfconcentration_inlet = math.eval('res_bulkconc1 - rxn_observed_rconst*res_bulkconc1/ndim_massXfer_coeff/cat_interfacial_area',catscope);
      catscope.rxn_surfconcentration_inlet = rxn_surfconcentration_inlet;

      var rxn_surfconcentration_outlet = math.eval('res_bulkconc1*(1/exp(rxn_observed_rconst/volumetric_flowrate*mass_catalyst)) - rxn_observed_rconst*res_bulkconc1/ndim_massXfer_coeff/cat_interfacial_area*(1/exp(rxn_observed_rconst/volumetric_flowrate*mass_catalyst))',catscope);
      catscope.rxn_surfconcentration_outlet = rxn_surfconcentration_outlet;

      //////////////////////
      var rxn_surfconcentration = math.eval('rxn_avg_bulk_concentration1 - (rxn_rate/ndim_massXfer_coeff/cat_interfacial_area)',catscope);
     catscope.rxn_surfconcentration = rxn_surfconcentration;

    } else if (catscope.dr_rxn_order == 2) {
      //perform calculations
      var rxn_observed_rconst = math.eval('rxn_rate/res_bulkconc1^2/(1-rxn_conversion1)',catscope);
      catscope.rxn_observed_rconst = rxn_observed_rconst;

      var rxn_avg_bulk_concentration1 = math.eval('volumetric_flowrate/(rxn_observed_rconst*mass_catalyst)*log(rxn_observed_rconst*res_bulkconc1/volumetric_flowrate*mass_catalyst + 1)',catscope); //2nd Order
      catscope.rxn_avg_bulk_concentration1 = rxn_avg_bulk_concentration1;

      var rxn_rate_inlet = math.eval('rxn_observed_rconst*res_bulkconc1^2',catscope); //rate of reaction @ inlet in units of mol/kgcat/s
      catscope.rxn_rate_inlet = rxn_rate_inlet;

      var rxn_rate_outlet = math.eval('rxn_observed_rconst*res_bulkconc1^2*(1 - rxn_conversion1)^2',catscope);//rate of reaction @ outlet in units of mol/kgcat/s
      catscope.rxn_rate_outlet = rxn_rate_outlet;

     var rxn_bulkconc_outlet1 = math.eval('res_bulkconc1*(1 - rxn_conversion1)',catscope);
      catscope.rxn_bulkconc_outlet1 = rxn_bulkconc_outlet1;

      var rxn_surfconcentration_inlet = math.eval('res_bulkconc1 - rxn_observed_rconst*res_bulkconc1^2/ndim_massXfer_coeff/cat_interfacial_area',catscope);
      catscope.rxn_surfconcentration_inlet = rxn_surfconcentration_inlet;

      var rxn_surfconcentration_outlet = math.eval('res_bulkconc1/(rxn_observed_rconst*res_bulkconc1/volumetric_flowrate*mass_catalyst + 1) - rxn_observed_rconst*res_bulkconc1^2/ndim_massXfer_coeff/cat_interfacial_area*(1/(rxn_observed_rconst*res_bulkconc1/volumetric_flowrate*mass_catalyst + 1))^2',catscope);
      catscope.rxn_surfconcentration_outlet = rxn_surfconcentration_outlet;

      //////////////////////
      var rxn_surfconcentration = math.eval('rxn_avg_bulk_concentration1 - (rxn_rate/ndim_massXfer_coeff/cat_interfacial_area)',catscope);
      catscope.rxn_surfconcentration = rxn_surfconcentration;

    }

    //var rxn_surfconcentration = math.eval('res_bulkconc1 - (rxn_rate/ndim_massXfer_coeff/cat_interfacial_area)',catscope);
      //catscope.rxn_surfconcentration = rxn_surfconcentration;

    var rxn_externalconc_grad = math.eval('(rxn_avg_bulk_concentration1 - rxn_surfconcentration)*100/rxn_avg_bulk_concentration1',catscope);
    catscope.rxn_externalconc_grad = rxn_externalconc_grad;

    writeOut(rxn_externalconc_grad_out,rxn_externalconc_grad);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for external temperature gradient
  $("#ndim_massXfer_coeff,#ndim_heatXfer_coeff,#rxn_surfconcentration,#rxn_rate,#temp").on('keyup keydown change', function (){
    //id string of output field
    var rxn_externaltemp_grad_out = "#rxn_externaltemp_grad";

    //perform calculations
    var rxn_surftemperature = math.eval('-rxn_enthalpy*ndim_massXfer_coeff/ndim_heatXfer_coeff*(rxn_avg_bulk_concentration1 - rxn_surfconcentration) + temp',catscope);
    catscope.rxn_surftemperature = rxn_surftemperature;

    var rxn_externaltemp_grad = math.eval('rxn_surftemperature - temp',catscope);
    catscope.rxn_externaltemp_grad = rxn_externaltemp_grad;

    //actually write the data to the appropriate cell
    writeOut(rxn_externaltemp_grad_out,rxn_externaltemp_grad);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for Weisz-Prater Modulus, Thiele Modulus, and Effectiveness Factor @ inlet, outlet and average
  $("#rxn_surfconcentration,#rxn_surftemperature,#temp,#diff_knudsen,#cat_pore_tortuosity,#pressure").on('keyup keydown change', function (){
    //id string of output field
    var rxn_weisz_prater_out = "#rxn_weisz_prater"; //unitless
    var rxn_weisz_prater_inlet_out = "#rxn_weisz_prater_inlet"; //unitless
    var rxn_weisz_prater_outlet_out = "#rxn_weisz_prater_outlet"; //unitless

    var rxn_thiele_out = "#rxn_thiele"; //unitless
    var rxn_thiele_inlet_out = "#rxn_thiele_inlet"; //unitless
    var rxn_thiele_outlet_out = "#rxn_thiele_outlet"; //unitless

    var rxn_eff_factor_out = "#rxn_eff_factor"; //unitless
    var rxn_eff_factor_inlet_out = "#rxn_eff_factor_inlet"; //unitless
    var rxn_eff_factor_outlet_out = "#rxn_eff_factor_outlet"; //unitless

    //perform calculations
    var aris_L = math.eval('cat_particle_vol/cat_ext_area',catscope); //only applies to catalyts with complete active material depth
    catscope.aris_L = aris_L;

    var rxn_weisz_prater = math.eval('rxn_rate*cat_rho_particle*aris_L^2*(dr_rxn_order+1)/2/rxn_surfconcentration/diff_effective',catscope);
    catscope.rxn_weisz_prater = rxn_weisz_prater;
    var rxn_weisz_prater_inlet = math.eval('rxn_rate_inlet*cat_rho_particle*aris_L^2*(dr_rxn_order+1)/2/rxn_surfconcentration_inlet/diff_effective',catscope);
    var rxn_weisz_prater_outlet = math.eval('rxn_rate_outlet*cat_rho_particle*aris_L^2*(dr_rxn_order+1)/2/rxn_surfconcentration_outlet/diff_effective',catscope);


    catscope.rxn_weisz_prater_inlet = rxn_weisz_prater_inlet;
    catscope.rxn_weisz_prater_outlet = rxn_weisz_prater_outlet;

    if (catscope.rxn_weisz_prater <= 1) {
      var rxn_thiele = math.eval('rxn_weisz_prater^0.575*(0.334*rxn_weisz_prater^0.972 + (1/rxn_weisz_prater)^0.075)',catscope); //has maximum error of 0.23% at M_WP = 0.999
      catscope.rxn_thiele = rxn_thiele;

      var rxn_thiele_inlet = math.eval('rxn_weisz_prater_inlet^0.575*(0.334*rxn_weisz_prater_inlet^0.972 + (1/rxn_weisz_prater_inlet)^0.075)',catscope);
      var rxn_thiele_outlet = math.eval('rxn_weisz_prater_outlet^0.575*(0.334*rxn_weisz_prater_outlet^0.972 + (1/rxn_weisz_prater_outlet)^0.075)',catscope);

      catscope.rxn_thiele_inlet = rxn_thiele_inlet;
      catscope.rxn_thiele_outlet = rxn_thiele_outlet;

    } else if (1 < catscope.rxn_weisz_prater < 2) {
      var rxn_thiele = math.eval('rxn_weisz_prater + (1/3)',catscope); //error is lower than above across range that it is applied
      catscope.rxn_thiele = rxn_thiele;

      var rxn_thiele_inlet = math.eval('rxn_weisz_prater_inlet + (1/3)',catscope);
      var rxn_thiele_outlet = math.eval('rxn_weisz_prater_outlet + (1/3)',catscope);

      catscope.rxn_thiele_inlet = rxn_thiele_inlet;
      catscope.rxn_thiele_outlet = rxn_thiele_outlet;

    } else if (catscope.rxn_weisz_prater >= 2) {
      var rxn_thiele = math.eval('rxn_weisz_prater ',catscope); //error is lower than above across range that it is applied
      catscope.rxn_thiele = rxn_thiele;

      var rxn_thiele_inlet = math.eval('rxn_weisz_prater_inlet ',catscope);
      var rxn_thiele_outlet = math.eval('rxn_weisz_prater_outlet ',catscope);

      catscope.rxn_thiele_inlet = rxn_thiele_inlet;
      catscope.rxn_thiele_outlet = rxn_thiele_outlet;


    } else {
      //do nothing
    }

    var rxn_eff_factor = math.eval('rxn_weisz_prater/rxn_thiele^2',catscope);
    catscope.rxn_eff_factor = rxn_eff_factor;

    var rxn_eff_factor_inlet = math.eval('rxn_weisz_prater_inlet/rxn_thiele_inlet^2',catscope);
    var rxn_eff_factor_outlet = math.eval('rxn_weisz_prater_outlet/rxn_thiele_outlet^2',catscope);

    catscope.rxn_eff_factor_inlet = rxn_eff_factor_inlet;
    catscope.rxn_eff_factor_outlet = rxn_eff_factor_outlet;


    //actually write the data to the appropriate cell
    writeOut(rxn_weisz_prater_out,rxn_weisz_prater);
    writeOut(rxn_weisz_prater_inlet_out,rxn_weisz_prater_inlet);
    writeOut(rxn_weisz_prater_outlet_out,rxn_weisz_prater_outlet);

    writeOut(rxn_thiele_out,rxn_thiele);
    writeOut(rxn_thiele_inlet_out,rxn_thiele_inlet);
    writeOut(rxn_thiele_outlet_out,rxn_thiele_outlet);

    writeOut(rxn_eff_factor_out,rxn_eff_factor);
    writeOut(rxn_eff_factor_inlet_out,rxn_eff_factor_inlet);
    writeOut(rxn_eff_factor_outlet_out,rxn_eff_factor_outlet);
  });


  //////////////////////////////////////////////////////////////////////////////
  // function for Prater Number or thermicity
  $("#rxn_enthalpy,#diff_effective,#rxn_surfconcentration,#cat_thermal_cond,#rxn_surftemperature").on('keyup keydown change', function (){
    //id string of output field
    var ndim_prater_out = "#ndim_prater"; //unitless

    //perform calculations
    var ndim_prater = math.eval('-rxn_enthalpy*diff_effective*rxn_surfconcentration/cat_thermal_cond/rxn_surftemperature',catscope);
    catscope.ndim_prater = ndim_prater;

    //actually write the data to the appropriate cell
    writeOut(ndim_prater_out,ndim_prater);
  });


  //////////////////////////////////////////////////////////////////////////////
  // function for Internal Temperature Gradient
  $("#rxn_enthalpy,#diff_effective,#rxn_surfconcentration,#cat_thermal_cond,#rxn_thiele,#temp,#rxn_surftemperature").on('keyup keydown change', function (){
    //id string of output field
    var rxn_internaltemp_grad_out = "#rxn_internaltemp_grad"; //unitless

    //perform calculations
    var rxn_internaltemp_grad = math.eval('-rxn_enthalpy*diff_effective/cat_thermal_cond*(rxn_surfconcentration - (rxn_surfconcentration/cosh(rxn_thiele)))',catscope);
    catscope.rxn_internaltemp_grad = rxn_internaltemp_grad;

    //actually write the data to the appropriate cell
    writeOut(rxn_internaltemp_grad_out,rxn_internaltemp_grad);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for Intrinsic first-order rate constant
  $("#rxn_rate,#rxn_eff_factor,#rxn_surfconcentration,#rxn_surftemperature,#rxn_internaltemp_grad").on('keyup keydown change', function (){
    //id string of output field
    var rxn_intrinsic_rconst_out = "#rxn_intrinsic_rconst"; //unitless

    //perform calculations
    var rxn_intrinsic_rconst = math.eval('rxn_rate/rxn_eff_factor/rxn_surfconcentration',catscope);
    catscope.rxn_intrinsic_rconst = rxn_intrinsic_rconst;

    //actually write the data to the appropriate cell
    writeOut(rxn_intrinsic_rconst_out,rxn_intrinsic_rconst);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for calculating axial dispersion coeff, Peclet number, and Bodenstein number
  $("#rxn_rate,#cat_rho_bulk,#R_p,#molfrac2,#molfrac3,#rxn_surfconcentration").on('keyup keydown change', function (){
    //id string of output field
    var axial_disp_coeff_out = "#axial_disp_coeff";
    var ndim_peclet_out = "#ndim_peclet";
    var ndim_bodenstein_out = "#ndim_bodenstein";

    //perform calculations and logical tests

    if (catscope.dr_reaction_phase == "Gas Phase") { //first check if the phase is gas phase for axial disp coefficients
      if (catscope.ndim_reynolds > 1) {
        var axial_disp_coeff = math.eval('cat_effective_radius_ergun*superf_mass_flux/avg_density',catscope);
      } else if (catscope.ndim_reynolds <= 1){
        var axial_disp_coeff = math.eval('diff_mixture*cat_void_frac/bed_tortuosity',catscope); //bed_tortuosity is selected earlier based on dr_cat_shape
      } else {
        var axial_disp_coeff = 0;
      }
    } else if (catscope.dr_reaction_phase == "Liquid Phase") {//next check if the phase is liquid phase for axial disp coefficients
      if (catscope.ndim_reynolds < 0.0001) {
        var axial_disp_coeff = math.eval('diff_mixture*cat_void_frac/bed_tortuosity',catscope);
      } else if (catscope.ndim_reynolds < 1000 && catscope.ndim_reynolds >= 0.0001) {
        var axial_disp_coeff = math.eval('4*cat_effective_radius_ergun*superf_mass_flux/avg_density',catscope);
      } else if (catscope.ndim_reynolds >= 1000){
        var axial_disp_coeff = math.eval('cat_effective_radius_ergun*superf_mass_flux/avg_density',catscope);
      } else {
        var axial_disp_coeff = 0;
      }
    }

    catscope.axial_disp_coeff = axial_disp_coeff;

    var ndim_peclet = math.eval('L_bed*superf_mass_flux/avg_density/axial_disp_coeff',catscope);
    catscope.ndim_peclet = ndim_peclet;

    var ndim_bodenstein = math.eval('2*cat_effective_radius_ergun*superf_mass_flux/avg_density/axial_disp_coeff',catscope); //possibly wrong but not used for anything
    catscope.ndim_bodenstein = ndim_bodenstein;

    //write values to appropriate cells
    writeOut(axial_disp_coeff_out,axial_disp_coeff);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for calculating radial dispersion coeff, and equations from Sie et. al.
  $("#rxn_rate,#cat_rho_bulk,#R_p,#molfrac2,#molfrac3,#rxn_surfconcentration,#rxn_surftemperature").on('keyup keydown change', function (){
    //id string of output field
    var radial_disp_coeff_out = "#radial_disp_coeff";

    //perform calculations and logical tests
    var radial_disp_coeff = math.eval('2*cat_effective_radius_ergun*superf_mass_flux/cat_void_frac/avg_density*((1/ndim_peclet_f) + cat_void_frac/bed_tortuosity/ndim_reynolds/ndim_schmidt)',catscope);
    catscope.radial_disp_coeff = radial_disp_coeff;

    var sie_kappa = math.eval('0.07*(10^(-R_rctr/20/cat_effective_radius_ergun))',catscope)
    catscope.sie_kappa = sie_kappa;

    //write values to appropriate cells
    writeOut(radial_disp_coeff_out,radial_disp_coeff);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for Mears radial interparticle heat transport calculations
  $("#rxn_rate,#cat_rho_bulk,#R_p,#molfrac2,#molfrac3,#rxn_surfconcentration").on('keyup keydown change', function (){
    //id string of output field
    var schlunder_thermal_cond_out = "#schlunder_thermal_cond";

    //perform calculations and logical tests

    var schlunder_B = math.eval('schlunder_C*((1-cat_void_frac)/cat_void_frac)^(10/9)',catscope);
    catscope.schlunder_B = schlunder_B;

    var schlunder_thermal_cond_static = math.eval('avg_k_conduct*(1 - sqrt(1-cat_void_frac) + 2*sqrt(1-cat_void_frac)/(1-avg_k_conduct*schlunder_B/cat_thermal_cond)*((1-avg_k_conduct/cat_thermal_cond)*schlunder_B/(1-avg_k_conduct*schlunder_B/cat_thermal_cond)^2*log(cat_thermal_cond/schlunder_B/avg_k_conduct) - (schlunder_B + 1)/2 - (schlunder_B - 1)/(1-avg_k_conduct*schlunder_B/cat_thermal_cond)))',catscope);
    catscope.schlunder_thermal_cond_static = schlunder_thermal_cond_static;

    var bed_thermal_cond_dynamic = math.eval('avg_k_conduct*ndim_reynolds*ndim_prandtl/ndim_peclet_r_inf',catscope);
    catscope.bed_thermal_cond_dynamic = bed_thermal_cond_dynamic;

    var schlunder_thermal_cond = math.eval('schlunder_thermal_cond_static + bed_thermal_cond_dynamic',catscope);
    catscope.schlunder_thermal_cond = schlunder_thermal_cond;

    var radius_ratio=math.eval('R_rctr/cat_effective_radius',catscope);
    catscope.radius_ratio=radius_ratio;

    var nusselt_wall_out=math.eval('(1.3+(5/radius_ratio))*(schlunder_thermal_cond_static/avg_k_conduct)',catscope)
    catscope.nusselt_wall_out=nusselt_wall_out;

    var nusselt_wall_mix=math.eval('0.054*ndim_reynolds*ndim_prandtl',catscope)
    catscope.nusselt_wall_mix=nusselt_wall_mix;

    var nusselt_wall_adj=math.eval('0.3*((ndim_prandtl)^0.33)*(ndim_reynolds)^0.75',catscope);
    catscope.nusselt_wall_adj=nusselt_wall_adj;

    var nusselt_wall=math.eval('nusselt_wall_out+(1/((1/nusselt_wall_mix)+(1/nusselt_wall_adj)))',catscope);
    catscope.nusselt_wall=nusselt_wall;

    var wall_heat_coeff=math.eval('nusselt_wall*(avg_k_conduct/(2*cat_effective_radius))',catscope);
    catscope.wall_heat_coeff=wall_heat_coeff;

    //write values to appropriate cells
    writeOut(schlunder_thermal_cond_out,schlunder_thermal_cond);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for calculating pressure drop via Ergun equation
  $("#rxn_rate,#cat_rho_bulk,#R_p,#molfrac2,#molfrac3,#rxn_surfconcentration").on('keyup keydown change', function (){
    //id string of output field
    var bed_pressure_drop_out = "#bed_pressure_drop";

    //perform calculations and logical tests
    var ndim_reynolds_ergunR = math.eval('2*superf_mass_flux*cat_effective_radius_ergun/avg_viscosity',catscope);
    catscope.ndim_reynolds_ergunR = ndim_reynolds_ergunR;

    var bed_pressure_drop_SI = math.eval('L_bed*(superf_mass_flux^2*(1 - cat_void_frac)/avg_density/2/cat_effective_radius_ergun/cat_void_frac^3*(150*(1 - cat_void_frac)/ndim_reynolds_ergunR + 1.75))',catscope); //ergun parameters are hardcoded to 150 and 1.75
    catscope.bed_pressure_drop_SI = bed_pressure_drop_SI; //Pascals

    var bed_pressure_drop = math.eval('bed_pressure_drop_SI/1e5',catscope);
    catscope.bed_pressure_drop = bed_pressure_drop; //bar

    //write values to appropriate cells
    writeOut(bed_pressure_drop_out,bed_pressure_drop);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for calculating space time and superficial velocity
  $("#rxn_rate,#cat_rho_bulk,#R_p,#molfrac2,#molfrac3,#rxn_surfconcentration").on('keyup keydown change', function (){
    //id string of output field
    //var superf_velocity_out = "#superf_velocity";
    var bed_space_time_out = "#bed_space_time";

    //perform calculations and logical tests
    var bed_space_time = math.eval('bed_volume/mass_flowrate*avg_density',catscope);
    catscope.bed_space_time = bed_space_time;

    //write values to appropriate cells
    writeOut(bed_space_time_out,bed_space_time);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for calculating solid conductivity
  $("#rxn_rate,#cat_rho_bulk,#R_p,#molfrac2,#molfrac3,#rxn_surfconcentration,#rxn_surftemperature").on('keyup keydown change', function (){
    //id string of output field

    //perform calculations and logical tests
    var dixon_kappa = math.eval('cat_thermal_cond/avg_k_conduct',catscope);
    catscope.dixon_kappa = dixon_kappa;

    var dixon_phi1 = math.eval('0.333*(1-1/dixon_kappa)^2/(log(dixon_kappa - 0.577*(dixon_kappa-1)) - 0.423*(1-1/dixon_kappa)) - 2/3/dixon_kappa',catscope);
    catscope.dixon_phi1 = dixon_phi1;

    var dixon_phi2 = math.eval('0.072*(1 - 1/dixon_kappa)^2/(log(dixon_kappa - 0.925*(dixon_kappa-1)) - 0.075*(1-1/dixon_kappa)) - 2/3/dixon_kappa',catscope);
    catscope.dixon_phi2 = dixon_phi2;

    var dixon_lv_dp = math.eval('dixon_phi2 + (dixon_phi1 - dixon_phi2)*(cat_void_frac - 0.26)/(0.476 - 0.26)',catscope);
    catscope.dixon_lv_dp = dixon_lv_dp;

    var dixon_krs = math.eval('avg_k_conduct*(cat_void_frac + (1 - cat_void_frac)/(dixon_lv_dp + 2/3/dixon_kappa))',catscope);
    catscope.dixon_krs = dixon_krs; //currently UNUSED -- using other correlation instead

    //write values to appropriate cells
    //nothing to output here
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for calculating overall "h" for reactor
  $("#rxn_rate,#cat_rho_bulk,#R_p,#molfrac2,#molfrac3,#rxn_surfconcentration,#rxn_surftemperature").on('keyup keydown change', function (){
    //id string of output field
    var dixon_h_wall_out = "#dixon_h_wall";
    var dixon_h_overall_out = "#dixon_h_overall";

    //perform calculations and logical tests
    var ndim_peclet_rf = math.eval('1/(cat_void_frac*bed_tortuosity/ndim_reynolds/ndim_prandtl + 1/ndim_peclet_r_inf)',catscope);
    catscope.ndim_peclet_rf = ndim_peclet_rf;

    var ndim_nusselt_fluidsolid = math.eval('0.255/cat_void_frac*ndim_prandtl^0.33*ndim_reynolds^0.67',catscope);
    catscope.ndim_nusselt_fluidsolid = ndim_nusselt_fluidsolid;

    var dixon_n_solid = math.eval('1.5*(1 - cat_void_frac)*(R_rctr/cat_effective_radius_ergun)^2/(schlunder_thermal_cond_static/avg_k_conduct*(1/ndim_nusselt_fluidsolid + 0.1*avg_k_conduct/cat_thermal_cond))',catscope); // using cat_effective_radius_ergun as recommended by Landon, Hebert, Adams AIChE Symposium Series, Vol 92, 1996, pg 134
    catscope.dixon_n_solid = dixon_n_solid;

    var dixon_n_fluid = math.eval('1.5*(1 - cat_void_frac)*(R_rctr/cat_effective_radius_ergun)^2/(ndim_reynolds*ndim_prandtl/ndim_peclet_rf*(1/ndim_nusselt_fluidsolid + 0.1*avg_k_conduct/cat_thermal_cond))',catscope);
    catscope.dixon_n_fluid = dixon_n_fluid;

    var ndim_nusselt_wallfluid = math.eval('0.523*(1 - cat_effective_radius_volequiv/R_rctr)*ndim_prandtl^0.33*ndim_reynolds^0.738',catscope);
    catscope.ndim_nusselt_wallfluid = ndim_nusselt_wallfluid;

    var dixon_beta_solid = math.eval('schlunder_thermal_cond_static/avg_k_conduct/(8/dixon_n_solid + (ndim_biot_solid + 4)/ndim_biot_solid)',catscope);
    catscope.dixon_beta_solid = dixon_beta_solid;

    var ndim_biot_fluid = math.eval('ndim_nusselt_wallfluid*R_rctr*ndim_peclet_rf/2/cat_effective_radius_volequiv/ndim_reynolds/ndim_prandtl',catscope);
    catscope.ndim_biot_fluid = ndim_biot_fluid;

    var dixon_beta_fluid = math.eval('ndim_reynolds*ndim_prandtl/ndim_peclet_rf/(8/dixon_n_fluid + (ndim_biot_fluid + 4)/ndim_biot_fluid)',catscope);
    catscope.dixon_beta_fluid = dixon_beta_fluid;

    if (catscope.ndim_reynolds >= 100) {
      var dixon_h_wall = math.eval('avg_k_conduct/2/cat_effective_radius_ergun*(8*dixon_beta_solid*cat_effective_radius_ergun/R_rctr + ndim_nusselt_wallfluid*(1 + dixon_beta_solid*ndim_peclet_rf/ndim_reynolds/ndim_prandtl))',catscope);
      catscope.dixon_h_wall = dixon_h_wall;
    } else if (catscope.ndim_reynolds < 100) {
      var dixon_h_wall = math.eval('avg_k_conduct/2/cat_effective_radius_ergun*(8*dixon_beta_fluid*cat_effective_radius_ergun/R_rctr + 2*ndim_biot_solid*schlunder_thermal_cond_static*cat_effective_radius_ergun/avg_k_conduct/R_rctr*(1 + dixon_beta_fluid*avg_k_conduct/schlunder_thermal_cond_static))',catscope);
      catscope.dixon_h_wall = dixon_h_wall;
    } else {
      //do nothing
    }

    var dixon_h_overall = math.eval('1/(1/dixon_h_wall + R_rctr/4/schlunder_thermal_cond)',catscope); //W per m^2 per K
    catscope.dixon_h_overall = dixon_h_overall;

    //write values to appropriate cells
    writeOut(dixon_h_overall_out,dixon_h_overall);
    writeOut(dixon_h_wall_out,dixon_h_wall);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for calculating reactor hotspot magnitude
  $("#rxn_rate,#cat_rho_bulk,#R_p,#molfrac2,#molfrac3,#rxn_surfconcentration,#rxn_surftemperature").on('keyup keydown change', function (){
    //id string of output field
    var bed_axial_max_deltatemp_out = "#bed_axial_max_deltatemp";

    //perform calculations and logical tests
    var bed_axial_max_deltatemp_shapefactor = 1; //fixed at 1
    catscope.bed_axial_max_deltatemp_shapefactor = bed_axial_max_deltatemp_shapefactor;

    var bed_axial_max_deltatemp = math.eval('-bed_axial_max_deltatemp_shapefactor*molar_flowrate1*rxn_enthalpy*rxn_conversion1/pi/dixon_h_overall/R_rctr/L_bed',catscope);
    catscope.bed_axial_max_deltatemp = bed_axial_max_deltatemp;

    //write values to appropriate cells
    writeOut(bed_axial_max_deltatemp_out,bed_axial_max_deltatemp);
  });

  //////////////////////////////////////////////////////////////////////////////
  // function for particle-scale validation tests
  $("#rxn_rate,#cat_rho_bulk,#R_p,#molfrac2,#molfrac3,#rxn_surfconcentration,#rxn_surftemperature").on('keyup keydown change', function (){
    //id string of output field
    var test_realrate_out = "#test_realrate"; //
    var test_molfrac_out = "#test_molfrac"; //
    var test_voidfrac_out = "#test_voidfrac"; //
    var test_kp_out = "#test_kp"; //
    var test_porosity_out = "#test_porosity"; //
    var test_tortuosity_out = "#test_tortuosity"; //
    var test_ndim_prandtl_out = "#test_ndim_prandtl"; //
    var test_ndim_reynolds_out = "#test_ndim_reynolds"; //
    var test_ndim_prater_out = "#test_ndim_prater"; //
    var test_externalconc_limit_out = "#test_externalconc_limit"; //
    var test_externalconc_control_out = "#test_externalconc_control"; //
    var test_externaltemp_out = "#test_externaltemp"; //
    var test_internaltemp_out = "#test_internaltemp"; //
    var test_internalconc_limit_out = "#test_internalconc_limit"; //
    var test_internalconc_strong_out = "#test_internalconc_strong"; //

    //yes-no array
    var test_result = ["no","yes"];
    var test_result_alt = ["no","yes!"];


    //next comes the logical tests used in the sheet
    if (catscope.rxn_rate < catscope.rxn_maxlimitingrate) {
      writeOut(test_realrate_out,test_result[1]);
      $('#test_realrate').prop("class","clcd-green");
    } else if (catscope.rxn_rate >= catscope.rxn_maxlimitingrate) {
      //actually write the result to the appropriate field
      writeOut(test_realrate_out,test_result[0]);
      $('#test_realrate').prop("class","clcd-red");
    } else {
      writeOut(test_realrate_out,'Undefined');
      $('#test_realrate').prop("class","");
    }

    if (catscope.molTest == 1) {
      writeOut(test_molfrac_out,test_result[1]);
      $('#test_molfrac').prop("class","clcd-green");
    } else if (catscope.molTest == 0) {
      //actually write the result to the appropriate field
      writeOut(test_molfrac_out,test_result[0]);
      $('#test_molfrac').prop("class","clcd-red");
    } else {
      writeOut(test_molfrac_out,'Undefined');
      $('#test_molfrac').prop("class","");
    }


    if (catscope.cat_void_frac < 0.55 && catscope.cat_void_frac > 0.25) {
      writeOut(test_voidfrac_out,test_result[1]);
      $('#test_voidfrac').prop("class","clcd-green");
    } else if (catscope.cat_void_frac >= 0.55 || catscope.cat_void_frac <= 0.25) {
      //actually write the result to the appropriate field
      writeOut(test_voidfrac_out,test_result[0]);
      $('#test_voidfrac').prop("class","clcd-red");
    } else {
      writeOut(test_voidfrac_out,'Undefined');
      $('#test_voidfrac').prop("class","");
    }


    if (catscope.cat_thermal_cond < 1 && catscope.cat_thermal_cond > 0.1) {
      writeOut(test_kp_out,test_result[1]);
      $('#test_kp').prop("class","clcd-green");
    } else if (catscope.cat_thermal_cond >= 1 || catscope.cat_thermal_cond <= 0.1) {
      //actually write the result to the appropriate field
      writeOut(test_kp_out,test_result[0]);
      $('#test_kp').prop("class","clcd-red");
    } else {
      writeOut(test_kp_out,'Undefined');
      $('#test_kp').prop("class","");
    }


    if (catscope.cat_porosity < 0.7) {
      writeOut(test_porosity_out,test_result[1]);
      $('#test_porosity').prop("class","clcd-green");
    } else if (catscope.cat_porosity >= 0.7) {
      //actually write the result to the appropriate field
      writeOut(test_porosity_out,test_result[0]);
      $('#test_porosity').prop("class","clcd-red");
    } else {
      writeOut(test_porosity_out,'Undefined');
      $('#test_porosity').prop("class","");
    }

    if (catscope.cat_pore_tortuosity < 6 && catscope.cat_pore_tortuosity > 2) {
      writeOut(test_tortuosity_out,test_result[1]);
      $('#test_tortuosity').prop("class","clcd-green");
    } else if (catscope.cat_pore_tortuosity >= 6 || catscope.cat_pore_tortuosity <= 2) {
      //actually write the result to the appropriate field
      writeOut(test_tortuosity_out,test_result[0]);
      $('#test_tortuosity').prop("class","clcd-red");
    } else {
      writeOut(test_tortuosity_out,'Undefined');
      $('#test_tortuosity').prop("class","");
    }

    if (catscope.ndim_prandtl < 1.5 && catscope.ndim_prandtl > 0.5) {
      writeOut(test_ndim_prandtl_out,test_result[1]);
      $('#test_ndim_prandtl').prop("class","clcd-green");
    } else if (catscope.ndim_prandtl >= 1.5 || catscope.ndim_prandtl <= 0.5) {
      //actually write the result to the appropriate field
      writeOut(test_ndim_prandtl_out,test_result[0]);
      $('#test_ndim_prandtl').prop("class","clcd-red");
    } else {
      writeOut(test_ndim_prandtl_out,'Undefined');
      $('#test_ndim_prandtl').prop("class","");
    }

    if (catscope.ndim_reynolds >= 0.01 && catscope.dr_reaction_phase == "Liquid Phase") {
      writeOut(test_ndim_reynolds_out,test_result[1]);
      $('#test_ndim_reynolds').prop("class","clcd-green");
    } else if (catscope.ndim_reynolds > 1 && catscope.dr_reaction_phase == "Gas Phase") {
      writeOut(test_ndim_reynolds_out,test_result[1]);
      $('#test_ndim_reynolds').prop("class","clcd-green");
    } else if (catscope.ndim_reynolds <= 0.01 && catscope.dr_reaction_phase == "Liquid Phase") {
      //actually write the result to the appropriate field
      writeOut(test_ndim_reynolds_out,test_result[0]);
      $('#test_ndim_reynolds').prop("class","clcd-red");
    } else if (catscope.ndim_reynolds <= 1 && catscope.dr_reaction_phase == "Gas Phase") {
      //actually write the result to the appropriate field
      writeOut(test_ndim_reynolds_out,test_result[0]);
      $('#test_ndim_reynolds').prop("class","clcd-red");
    } else {
      writeOut(test_ndim_reynolds_out,'Undefined');
      $('#test_ndim_reynolds').prop("class","");
    }

/////////////////////////////////////////////////////////////////
// logic switch, yes is "bad", no is "good"
//
/////////////////////////////////////////////////////////////////

    if (catscope.ndim_prater < 0.3) {
      writeOut(test_ndim_prater_out,test_result_alt[0]);
      $('#test_ndim_prater').prop("class","clcd-green");
    } else if (catscope.ndim_prater >= 0.3) {
      //actually write the result to the appropriate field
      writeOut(test_ndim_prater_out,test_result_alt[1]);
      $('#test_ndim_prater').prop("class","clcd-red");
    } else {
      writeOut(test_ndim_prater_out,'Undefined');
      $('#test_ndim_prater').prop("class","");
    }

    if (catscope.rxn_externalconc_grad < 5) {
      writeOut(test_externalconc_limit_out,test_result_alt[0]);
      $('#test_externalconc_limit').prop("class","clcd-green");
    } else if (catscope.rxn_externalconc_grad >= 5) {
      //actually write the result to the appropriate field
      writeOut(test_externalconc_limit_out,test_result_alt[1]);
      $('#test_externalconc_limit').prop("class","clcd-red");
    } else {
      writeOut(test_externalconc_limit_out,'Undefined');
      $('#test_externalconc_limit').prop("class","");
    }

    if (catscope.rxn_externalconc_grad < 50) {
      writeOut(test_externalconc_control_out,test_result_alt[0]);
      $('#test_externalconc_control').prop("class","clcd-green");
    } else if (catscope.rxn_externalconc_grad >= 50) {
      //actually write the result to the appropriate field
      writeOut(test_externalconc_control_out,test_result_alt[1]);
      $('#test_externalconc_control').prop("class","clcd-red");
    } else {
      writeOut(test_externalconc_control_out,'Undefined');
      $('#test_externalconc_control').prop("class","");
    }

    if (math.abs(catscope.rxn_externaltemp_grad) < 1) {
      writeOut(test_externaltemp_out,test_result_alt[0]);
      $('#test_externaltemp').prop("class","clcd-green");
    } else if (math.abs(catscope.rxn_externaltemp_grad) >= 1) {
      //actually write the result to the appropriate field
      writeOut(test_externaltemp_out,test_result_alt[1]);
      $('#test_externaltemp').prop("class","clcd-red");
    } else {
      writeOut(test_externaltemp_out,'Undefined');
      $('#test_externaltemp').prop("class","");
    }

    if (math.abs(catscope.rxn_internaltemp_grad) < 1) {
      writeOut(test_internaltemp_out,test_result_alt[0]);
      $('#test_internaltemp').prop("class","clcd-green");
    } else if (math.abs(catscope.rxn_internaltemp_grad) >= 1) {
      //actually write the result to the appropriate field
      writeOut(test_internaltemp_out,test_result_alt[1]);
      $('#test_internaltemp').prop("class","clcd-red");
    } else {
      writeOut(test_internaltemp_out,'Undefined');
      $('#test_internaltemp').prop("class","");
    }
/////////////////////////////////////////////////////////////////////
    if (catscope.rxn_eff_factor > 0.95) {
      writeOut(test_internalconc_limit_out,test_result_alt[0]);
      $('#test_internalconc_limit').prop("class","clcd-green");
    } else if (catscope.rxn_eff_factor <= 0.95) {
      //actually write the result to the appropriate field
      writeOut(test_internalconc_limit_out,test_result_alt[1]);
      $('#test_internalconc_limit').prop("class","clcd-red");
    } else {
      writeOut(test_internalconc_limit_out,'Undefined');
      $('#test_internalconc_limit').prop("class","");
    }

    if (catscope.rxn_eff_factor > 0.5) {
      writeOut(test_internalconc_strong_out,test_result_alt[0]);
      $('#test_internalconc_strong').prop("class","clcd-green");
    } else if (catscope.rxn_eff_factor <= 0.5) {
      //actually write the result to the appropriate field
      writeOut(test_internalconc_strong_out,test_result_alt[1]);
      $('#test_internalconc_strong').prop("class","clcd-red");
    } else {
      writeOut(test_internalconc_strong_out,'Undefined');
      $('#test_internalconc_strong').prop("class","");
    }

  });

  //////////////////////////////////////////////////////////////////////////////
  // function for bed-scale validation tests
  $("#rxn_rate,#cat_rho_bulk,#R_p,#molfrac2,#molfrac3,#rxn_surfconcentration,#rxn_surftemperature").on('keyup keydown change', function (){
    //id string of output field
    var test_pressure_drop_out = "#test_pressure_drop";

    var test_mears_dispersion_out = "#test_mears_dispersion"; //
    var test_mears_dispersion_LHS_out = "#test_mears_dispersion_LHS"; //
    var test_mears_dispersion_RHS_out = "#test_mears_dispersion_RHS"; //

    var test_gierman_dispersion_out = "#test_gierman_dispersion"; //
    var test_gierman_dispersion_LHS_out = "#test_gierman_dispersion_LHS"; //
    var test_gierman_dispersion_RHS_out = "#test_gierman_dispersion_RHS"; //

    var test_sie_walleffect_out = "#test_sie_walleffect"; //
    var test_sie_walleffect_LHS_out = "#test_sie_walleffect_LHS"; //
    var test_sie_walleffect_RHS_out = "#test_sie_walleffect_RHS"; //

    var test_mears_radial_interparticle_out = "#test_mears_radial_interparticle";
    var test_mears_radial_interparticle_LHS_out = "#test_mears_radial_interparticle_LHS";
    var test_mears_radial_interparticle_RHS_out = "#test_mears_radial_interparticle_RHS";

    //yes-no array
    var test_result = ["no","yes"];
    var test_result_alt = ["no","yes!"];

    //next comes the logical tests used in the sheet

    //pressure drop test -- via Ergun equation dP estimation
    if (catscope.bed_pressure_drop < math.eval('pressure*0.2/dr_rxn_order',catscope)) { //rxn_order is hardcoded to one
      writeOut(test_pressure_drop_out,test_result_alt[0]);
      $('#test_pressure_drop').prop("class","clcd-green");
    } else if (catscope.bed_pressure_drop >= math.eval('pressure*0.2/dr_rxn_order',catscope)) {
      writeOut(test_pressure_drop_out,test_result_alt[1]);
      $('#test_pressure_drop').prop("class","clcd-red");
    } else {
      writeOut(test_pressure_drop_out,'Undefined');
      $('#test_pressure_drop').prop("class","");
    }


    var mearsdisptest = math.eval('20*dr_rxn_order*log(1/(1-rxn_conversion1))',catscope);

    writeOut(test_mears_dispersion_LHS_out,catscope.ndim_peclet);
    writeOut(test_mears_dispersion_RHS_out,mearsdisptest);

    if (catscope.ndim_peclet > mearsdisptest) {
      writeOut(test_mears_dispersion_out,test_result_alt[0]);
      $('#test_mears_dispersion').prop("class","clcd-green");
    } else if (catscope.ndim_peclet <= mearsdisptest) {
      writeOut(test_mears_dispersion_out,test_result_alt[1]);
      $('#test_mears_dispersion').prop("class","clcd-red");
    } else {
      writeOut(test_mears_dispersion_out,'Undefined');
      $('#test_mears_dispersion').prop("class","");
    }

    var lengthratios = math.eval('L_bed/cat_effective_radius_ergun/2',catscope); //Gierman test

    writeOut(test_gierman_dispersion_LHS_out,lengthratios);
    writeOut(test_gierman_dispersion_RHS_out,mearsdisptest);

    if (lengthratios > mearsdisptest) {
      writeOut(test_gierman_dispersion_out,test_result_alt[0]);
      $('#test_gierman_dispersion').prop("class","clcd-green");
    } else if (lengthratios <= mearsdisptest) {
      writeOut(test_gierman_dispersion_out,test_result_alt[1]);
      $('#test_gierman_dispersion').prop("class","clcd-red");
    } else {
      writeOut(test_gierman_dispersion_out,'Undefined');
      $('#test_gierman_dispersion').prop("class","");
    }


    var siewalleffectstest = math.eval('2*R_rctr/cat_effective_radius_ergun',catscope);
    var sieLHS = math.eval('radial_disp_coeff*avg_density/R_rctr^2/superf_mass_flux',catscope);
    var sieRHS = math.eval('8*sie_kappa*dr_rxn_order/cat_void_frac*log(1/(1-rxn_conversion1))',catscope);

    writeOut(test_sie_walleffect_LHS_out,sieLHS);
    writeOut(test_sie_walleffect_RHS_out,sieRHS);

    if (siewalleffectstest > 20) { //"good result"
      writeOut(test_sie_walleffect_out,test_result_alt[0]);
      $('#test_sie_walleffect').prop("class","clcd-green");
    } else if (sieLHS > sieRHS) { //"good result"
      writeOut(test_sie_walleffect_out,test_result_alt[0]);
      $('#test_sie_walleffect').prop("class","clcd-green");
    } else if (sieLHS <= sieRHS) { //"bad result"
      writeOut(test_sie_walleffect_out,test_result_alt[1]);
      $('#test_sie_walleffect').prop("class","clcd-red");
    } else {
      writeOut(test_sie_walleffect_out,'Undefined');
      $('#test_sie_walleffect').prop("class","");
    }

    var mearsRadialInterparticleLHS = math.eval('abs(rxn_enthalpy)*rxn_rate*cat_rho_bulk*R_rctr^2/schlunder_thermal_cond/temp',catscope);
    var mearsRadialInterparticleRHS = math.eval('0.4*8.3145*temp/rxn_activation_energy/(1 + 8*schlunder_thermal_cond/R_rctr/dixon_h_wall)',catscope);

    writeOut(test_mears_radial_interparticle_LHS_out,mearsRadialInterparticleLHS);
    writeOut(test_mears_radial_interparticle_RHS_out,mearsRadialInterparticleRHS);

    if (mearsRadialInterparticleLHS < mearsRadialInterparticleRHS) {
      writeOut(test_mears_radial_interparticle_out,test_result_alt[0]);
      $('#test_mears_radial_interparticle').prop("class","clcd-green");
    } else if (mearsRadialInterparticleLHS > mearsRadialInterparticleRHS) {
      writeOut(test_mears_radial_interparticle_out,test_result_alt[1]);
      $('#test_mears_radial_interparticle').prop("class","clcd-red");
    } else {
      writeOut(test_mears_radial_interparticle_out,'Undefined');
      $('#test_mears_radial_interparticle').prop("class","");
    }

  });
});


////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////// Now begin section for plotting the graph with Flot
//////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////
//function for plotting graph
$(document).ready(function(){
  $("#plot_data").on('click', function (){
    var position = [2,1.99,1.98,1.97,1.96,1.95,1.94,1.93,1.92,1.91,1.9,1.89,1.88,1.87,1.86,1.85,1.84,1.83,1.82,1.81,1.8,1.79,1.78,1.77,1.76,1.75,1.74,1.73,1.72,1.71,1.7,1.69,1.68,1.67,1.66,1.65,1.64,1.63,1.62,1.61,1.6,1.59,1.58,1.57,1.56,1.55,1.54,1.53,1.52,1.51,1.5,1.49,1.48,1.47,1.46,1.45,1.44,1.43,1.42,1.41,1.4,1.39,1.38,1.37,1.36,1.35,1.34,1.33,1.32,1.31,1.3,1.29,1.28,1.27,1.26,1.25,1.24,1.23,1.22,1.21,1.2,1.19,1.18,1.17,1.16,1.15,1.14,1.13,1.12,1.11,1.1,1.09,1.08,1.07,1.06,1.05,1.04,1.03,1.02,1.01,1,0.99,0.98,0.97,0.96,0.95,0.94,0.93,0.92,0.91,0.9,0.89,0.88,0.87,0.86,0.85,0.84,0.83,0.82,0.81,0.8,0.79,0.78,0.77,0.76,0.75,0.74,0.73,0.72,0.71,0.7,0.69,0.68,0.67,0.66,0.65,0.64,0.63,0.62,0.61,0.6,0.59,0.58,0.57,0.56,0.55,0.54,0.53,0.52,0.51,0.5,0.49,0.48,0.47,0.46,0.45,0.44,0.43,0.42,0.41,0.4,0.39,0.38,0.37,0.36,0.35,0.34,0.33,0.32,0.31,0.3,0.29,0.28,0.27,0.26,0.25,0.24,0.23,0.22,0.21,0.2,0.19,0.18,0.17,0.16,0.15,0.14,0.13,0.12,0.11,0.1,0.09,0.08,0.07,0.06,0.05,0.04,0.03,0.02,0.01,0];

    var BLcoord = math.eval('1 + ndim_BL_thickness',catscope);

    var fxnConcentration = math.compile('rxn_surfconcentration*cosh(rxn_thiele*iterNdimPosition)/cosh(rxn_thiele)');
    //var fxnConcentrationInlet = math.compile('rxn_surfconcentration_inlet*cosh(rxn_thiele_inlet*iterNdimPosition)/cosh(rxn_thiele_inlet)');
    //var fxnConcentrationOutlet = math.compile('rxn_surfconcentration_outlet*cosh(rxn_thiele_outlet*iterNdimPosition)/cosh(rxn_thiele_outlet)');
    var fxnTemperature = math.compile('rxn_surftemperature - rxn_enthalpy*diff_effective/cat_thermal_cond*(rxn_surfconcentration - rxn_surfconcentration*cosh(rxn_thiele*iterNdimPosition)/cosh(rxn_thiele))');

    var fxnBLConcentration = math.compile('(res_bulkconc1 - rxn_surfconcentration)*iterNdimPosition/ndim_BL_thickness + res_bulkconc1 - (res_bulkconc1 - rxn_surfconcentration)/ndim_BL_thickness*(1 + ndim_BL_thickness)');
    //var fxnBLConcentrationInlet = math.compile('(res_bulkconc1 - rxn_surfconcentration_inlet)*iterNdimPosition/ndim_BL_thickness + res_bulkconc1 - (res_bulkconc1 - rxn_surfconcentration_inlet)/ndim_BL_thickness*(1 + ndim_BL_thickness)');
    //var fxnBLConcentrationOutlet = math.compile('(rxn_bulkconc_outlet1 - rxn_surfconcentration_outlet)*iterNdimPosition/ndim_BL_thickness + rxn_bulkconc_outlet1 - (rxn_bulkconc_outlet1 - rxn_surfconcentration_outlet)/ndim_BL_thickness*(1 + ndim_BL_thickness)');
    var fxnBLTemperature = math.compile('(temp - rxn_surftemperature)*iterNdimPosition/ndim_BL_thickness + temp - (temp - rxn_surftemperature)/ndim_BL_thickness*(1 + ndim_BL_thickness)');

    var concentration = [];
    var concentrationInlet = [];
    var concentrationOutlet = [];
    var temperature = [];

    for (i in position) { //iterate through index 'i' and evaluate the function at each point
      catscope.iterNdimPosition = position[i];

      if (catscope.iterNdimPosition > (1 + catscope.ndim_BL_thickness)){ //for outside of the boundary layer
        concentration[i] = catscope.res_bulkconc1;
        concentrationInlet[i] = catscope.res_bulkconc1;
        concentrationOutlet[i] = catscope.res_bulkconc1;
        temperature[i] = catscope.temp;
      } else if (catscope.iterNdimPosition > 1 && catscope.iterNdimPosition <= (1 + catscope.ndim_BL_thickness)){ //for inside of the boundary layer but outside particle
        concentration[i] = fxnBLConcentration.eval(catscope);
        //concentrationInlet[i] = fxnBLConcentrationInlet.eval(catscope);
        //concentrationOutlet[i] = fxnBLConcentrationOutlet.eval(catscope);
        temperature[i] = fxnBLTemperature.eval(catscope);
      } else if (catscope.iterNdimPosition <= 1){ //for inside the particle
        concentration[i] = fxnConcentration.eval(catscope);
        //concentrationInlet[i] = fxnConcentrationInlet.eval(catscope);
        //concentrationOutlet[i] = fxnConcentrationOutlet.eval(catscope);
        temperature[i] = fxnTemperature.eval(catscope);
      }
    }

    var conc = two1Dto2D(position,concentration);
    //var concInlet = two1Dto2D(position,concentrationInlet);
    //var concOutlet = two1Dto2D(position,concentrationOutlet);
    var temp = two1Dto2D(position,temperature);

    $.plot("#internalgradplot", [
      { data: conc, label: "C<sub>A,Average</sub>" },
      //{ data: concInlet, label: "C<sub>A,Inlet</sub>"},
      //{ data: concOutlet, label: "C<sub>A,Outlet</sub>"},
      { data: temp, yaxis: 2, label: "Temperature"}
    ], {
      xaxes: [ { axisLabel: 'Position in Catalyst Normalized to Radius / nondimensional' } ],
      yaxes: [ { min: 0, axisLabel: 'Concentration of A / mol × m<sup>-3</sup>', tickDecimals: 1}, { axisLabel: 'Temperature / K', minTickSize: 1, tickDecimals: 1 } ],
      legend: { show: "true", position: "se", background: {color: null}},
      grid: { hoverable: true, //needed for tooltip to work
      markings: [ { color: '#000', lineWidth: 1, xaxis: { from: 1, to: 1 } },
      { color: '#000', lineWidth: 1, xaxis: { from: BLcoord, to: BLcoord } }] },
      tooltip: { show: true }

    });

  });
});


////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////// Now begin section for the three popup dialogs; fuller_dvol, lebas_vb,
////// and wilke-chang suggestions
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////
//function for jQuery-UI of fuller diffusion volume dialog
$(document).ready(function(){

  $( "#dialog_fuller_dvol" ).dialog({
      autoOpen: false,
      width: 720,
      buttons: [
          {
              text: "Calculate",
              click: function() {
                $('#temp').trigger('change');
              }
          },
          {
              text: "Close",
              click: function() {
                  $( this ).dialog( "close" );
              }
          }
      ]
  });


  $( "#button_fuller_dvol" ).click(function( event ) {
	$( "#dialog_fuller_dvol" ).dialog( "open" );
	event.preventDefault();
  });

});

$(document).ready(function(){
        $("#dialog_1").dialog({
            autoOpen: false,
            width:1000,
                  buttons: [
          {
              text: "Calculate",
              click: function() {
                $('#temp, #boiling_point_1,#boiling_point_2, #boiling_point_3, #boiling_point_4, #boiling_point_5').trigger('change');
              }
          },
          {
              text: "Close",
              click: function() {
                  $( this ).dialog( "close" );
              }
          }
      ]
        });
        $("#button_physicalprop").on('click',function(){
              $("#dialog_1").dialog("open");
        });
});

$(document).ready(function(){
        $("#joback_show_nr").on('click',function(){
            $("#joback_nr").toggle("fast")
        });
         $("#joback_show_r").on('click',function(){
            $("#joback_r").toggle("fast")
        });
        $("#joback_show_halo").on('click',function(){
            $("#joback_halo").toggle("fast")
        });
        $("#joback_show_oxy").on('click',function(){
            $("#joback_oxy").toggle("fast")
        });
        $("#joback_show_nitro").on('click',function(){
            $("#joback_nitro").toggle("fast")
        });
        $("#joback_show_sulphur").on('click',function(){
            $("#joback_sulphur").toggle("fast")
        });
});

////////////////////////////////////////////////////////////////////////////
//function for jQuery-UI of Le Bas molar volume @ boiling point
$(document).ready(function(){

  $( "#dialog_lebas_vb" ).dialog({
      autoOpen: false,
      width: 820,
      buttons: [
          {
              text: "Calculate",
              click: function() {
                $('#temp').trigger('change');
              }
          },
          {
              text: "Close",
              click: function() {
                  $( this ).dialog( "close" );
              }
          }
      ]
  });


  $( "#button_lebas_vb" ).click(function( event ) {
    $( "#dialog_lebas_vb" ).dialog( "open" );
    event.preventDefault();
  });

});


////////////////////////////////////////////////////////////////////////////
//function for jQuery-UI of phi_Ai recommendation dialog for Wilke-Chang diffusivity
$(document).ready(function(){

  $( "#dialog_phiAi" ).dialog({
      autoOpen: false,
      width: 500,
      buttons: [
          {
              text: "Close",
              click: function() {
                  $( this ).dialog( "close" );
              }
          }
      ]
  });


  $( "#button_phi_suggestions" ).click(function( event ) {
	$( "#dialog_phiAi" ).dialog( "open" );
	event.preventDefault();
  });

});




/////////////
// How to add new OUTPUT variables:
// 1. actually write code that uses variables
// 2. add variable names to catscope initialization near top (e.g. catscope.varname = 0;)
// 3. add appropriate field to HTML



///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// The following code consists of various functions called above
// they are a mixture of jQuery and JS functions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////




///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//The standard jQuery function 'serializeArray' does not parse checkboxes, this is a modified version that
//DOES find them and more important returns 'null' when they are unchecked and 'on' when they are checked
$.fn.serializeArrayWithCheckboxes = function() {
  var rCRLF = /\r?\n/g;
  return this.map(function(){
      return this.elements ? jQuery.makeArray( this.elements ) : this;
  })

  .map(function( i, elem ){
      var val = jQuery( this ).val();


      if (val == null) {
        return val == null
      } else if (this.type == "checkbox" && this.checked == false) {
        return { name: this.name, value: this.checked ? this.value : ""}
      } else {
        return jQuery.isArray( val ) ?
              jQuery.map( val, function( val, i ){
                  return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
              }) :
          { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
      }
  }).get();
};


///////////////////////////////////////
//small function for conversion of strings to floating point numbers
String.prototype.toNum = function(){
  return parseFloat(this);
}

///////////////////////////////////////
//polyfill for Number.isNaN function implemented in ECMAScript 6
Number.isNaN = Number.isNaN || function(value) {
    return typeof value === "number" && isNaN(value);
}

///////////////////////////////////////
//polyfill for Number.isFinite function implemented in ECMAScript 6
Number.isFinite = Number.isFinite || function(value) {
    return typeof value === "number" && isFinite(value);
}


//////////////////////////////////////////////////////////////////////
//this function is used to pre-check output to prevent writing NaN to output cells
function writeOut(formid,value) {
  var formid_handle = $(formid);

  if (typeof value === "string" || value instanceof String) {
    formid_handle.val(value);
  } else if (Number.isFinite(value) || value instanceof Number) {
    formid_handle.val(math.format(value,val_out));
  } else if (isNaN(value)) {
    formid_handle.val(null);
  } else {
    formid_handle.val(null); //value = infinity will get here
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//calculate the binary diffusion coefficient for a pair of gases via the method of Fuller et. al.
function fullerBinaryDiff(mw_1,mw_2,temp,pressure,diffv_1,diffv_2) {
  //pressure needs to have units of bar


  //test if any test is false, else do not perform m.pow
  if (!diffv_1 || !diffv_2) {
    var inner = 1;
  } else {
    var inner = math.add(math.pow(diffv_1,1/3),math.pow(diffv_2,1/3));
  }

  numerator = math.multiply(0.001411,math.pow(temp,1.75));

  if (typeof mw_1 !== 'undefined' && typeof mw_2 !== 'undefined') {
    // the variable is defined
    MA = math.divide(1,mw_1);
    MB = math.divide(1,mw_2);
  } else {
    MA=0;
    MB=0;
  }


  MAB = math.multiply(2,math.pow(MA+MB,-1));
  var res_DAB_nonSI = math.divide(numerator,pressure*math.pow(MAB,0.5)*math.pow(inner,2));
  var res_DAB = math.divide(res_DAB_nonSI,1e4); //convert to m^2/s

  return res_DAB;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function idealGasDensity(mw,temp,pressure) {
  //mw in g/mol
  //temp in kelvin
  //pressure in bar

  var R = 8.3145; //J per mol per K --or-- m^3 * Pa per mol per K
  var pressure_Pa = math.multiply(pressure,100000); //convert to Pascals from bar

  ig_density = math.divide(pressure_Pa*mw,R*temp*1000); // kg per m^3

  return ig_density;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function mearsCriterion(rxn_order,rho_bulk,R_p,k_c,C_Ab,rate_A) {
  //rxn_order is unitless
  //rho_bulk is kg/m^3
  //R_p is in m
  //k_c is m/s
  //C_Ab is in kmol/m^3 (same as mol/L)
  //rate_A is in kmol/kgcat/s

  mearsCriterion = math.divide(-rate_A*rho_bulk*R_p*rxn_order,k_c*C_Ab);

  return mearsCriterion;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// a fairly self explanatory function that tests for approximate equality with unity
function doesItSumToOne(molFracArray) {
  var sum = math.sum(molFracArray);
  var sumRound = math.round(sum,2); //if sum is >=0.995 and <=1.004 then this returns 1

  if (sumRound == 1){
    return true;
  } else {
    return false;
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function molFracMixingFunction(molFracArray,propertyArray) {
  //this function is dumb and doesn't precheck sum-to-one
  var MixingProperty = math.sum(math.multiply(molFracArray,propertyArray));

  return MixingProperty
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//get the particle volume based on dimensions and particle shape
function particleVolume(R_p,L_p,R_p_inner,dr_cat_shape) {
  // this function does not do error reporting of any kind
  var cat_particle_vol;
  if (dr_cat_shape == "Spheres"){
    cat_particle_vol = math.multiply(math.divide(4,3)*3.141592654,math.pow(R_p,3));
  } else if (dr_cat_shape == "Cylinders"){
    cat_particle_vol = math.multiply(3.141592654*L_p,math.pow(R_p,2));
  } else if (dr_cat_shape == "Rings"){
    cat_particle_vol = math.multiply(3.141592654*L_p,math.subtract(math.pow(R_p,2),math.pow(R_p_inner,2)));
  }

  return cat_particle_vol
}

////////////////////////////////////////////////////////////////////////
//function for converting two 1D arrays into a pseudo-2D array for plotting with Flot
function two1Dto2D(a, b) {
  var c = [];
  for (i in a) {
    c[i] = [a[i], b[i]];
  }

  return c
}


//////////////////////////////////////////////////////////////////////
//this function is used to check arrays for NaN values and replace with zero
function replaceNaN(array){
  $.each(array, function(index, value){
    if (isNaN(value)) {
      array[index] = 0;
    } else {
      //do nothing
    }
  })
  return array
}

//////////////////////////////////////////////////////////////////////
//this function is used to check arrays for NaN values and replace with zero
function replaceInfwZero(array){
  $.each(array, function(index, value){
    if (isNaN(value)) {
      array[index] = Infinity;
    } else {
      //do nothing
    }
  })
  return array
}

//////////////////////////////////////////////////////////////////////
//find indexes of elements that have value of Infinity in array
function findInfIndices(array) {
  var InfinityIds = [];
  var j = 0;
  for (var i = 0; i <= array.length; i++) {
    if (array[i] == Infinity) {
      InfinityIds[j] = i;
      j++;
    }

  }
  return InfinityIds;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//take input of array in the order and size of the fuller method, then return a molecular formula string
function fullerArrayToFormula(array) {
  var MW_array_labels = ["C", "H", "O", "N", "S", "F", "Cl", "Br", "I"];

  var i = array.length;
  while (i--) {
      if (array[i] === 0) {
          array.splice(i, 1);
          MW_array_labels.splice(i, 1);
      }
  }

  var j = array.length;
  var formulaString = [];
  while (j--) {
    formulaString = MW_array_labels[j] + array[j] + formulaString;
  }

  return formulaString;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//take input of array in the order and size of the le bas method, then return a molecular formula string
//known bug is duplicate atom labels for different kinds of oxygen e.g. alcohol vs. ether
function lebasArrayToFormula(array) {
  var MW_array_labels = ["C","H","O","O","O","O","O","O","N","N","N","Br","Cl","F","I","S"];

  var i = array.length;
  while (i--) {
      if (array[i] === 0) {
          array.splice(i, 1);
          MW_array_labels.splice(i, 1);
      }
  }

  var j = array.length;
  var formulaString = [];
  while (j--) {
    formulaString = MW_array_labels[j] + array[j] + formulaString;
  }

  return formulaString;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//mixing function for thermal conductivities for liquids
function li_kf_MixingFunction(catscope) {
  var size = catscope.kfArray.length;
  var iterSize = math.subtract(size,1);

  var li_kf_c = math.zeros(size,size); //pre-initialize size of 'c' mathjs matrix

  for (var i = 0; i <= iterSize; i++) {
    for (var j = 0; j <= iterSize; j++) {
      var z = catscope.kfArray[j]/(catscope.kfArray[i] + catscope.kfArray[j]); //this calculates the i-jth component for populating matrix
      li_kf_c.subset(math.index(j,i), z); //replace i-jth component in 'c' with scalar 'z' above
    }
  }

  catscope.li_kf_c = li_kf_c;

  for (var i = 0; i <= iterSize; i++) {
    //look for NaN values and replace with zero; this will happen if
    //there are molecules that are empty and thus have zero kf values
    catscope.li_kf_c._data[i] = replaceNaN(catscope.li_kf_c._data[i]);
  }


  catscope.li_kf_d = math.eval('phiHat_Array*li_kf_c',catscope); //1xn times nxn returns 1xn
  catscope.li_kf_e = math.eval('phiHat_Array.*kfArray',catscope);//1xn elementwise times 1xn returns 1xn
  catscope.li_kf_f = math.eval('2*li_kf_e*transpose(li_kf_d)',catscope); //1xn times 1xn^Transpose returns scalar

  return catscope.li_kf_f
}

/*function missenread_thermal_cond(boiling_point,no_of_atoms,density_273,MW,Cp_273){
    var boiling
}
*/

function total_no_atoms(array1,array2){
	var scope={};
	scope.array1=array1;
	scope.array2=array2;
    var total_atoms=math.eval('array1*transpose(array2)',scope)
    return total_atoms
}

function total_no_atoms_fun(catscope){
	var total_no_atoms=[];
	for(i=0;i<5;i++){

		var joback_slice=catscope.joback.slice(i*39,(i+1)*39);
		catscope.joback_slice=joback_slice;

		total_no_atoms[i]=math.eval('joback_slice*transpose(atoms_array)',catscope);
	}
	return total_no_atoms;
}


//K

function joback_Tc_fun(catscope){
	var  joback_Tc_calc=[];
	var joback_Tc=[];

	for(i=0;i<5;i++){

		var joback_slice=catscope.joback.slice(i*39,(i+1)*39);
		catscope.joback_slice=joback_slice;

	    catscope.boiling_point_i=catscope.boiling_point_array[i];
		joback_Tc_calc[i]=math.eval('joback_slice*transpose(dTc_array)',catscope);//used in calculation of Tc
		catscope.joback_Tc_calc_i=joback_Tc_calc[i];


     	joback_Tc[i]=math.eval('boiling_point_i*((0.584+0.965*joback_Tc_calc_i-(joback_Tc_calc_i)^2)^-1)',catscope);

	}
	return joback_Tc
}



//bar


function joback_Pc_fun(catscope){
	var joback_Pc=[];

	for(i=0;i<5;i++){

		var joback_slice=catscope.joback.slice(i*39,(i+1)*39);
		catscope.joback_slice=joback_slice;

		catscope.total_no_atoms_i=catscope.total_no_atoms_array[i];
     	joback_Pc[i]=math.eval('(0.113+0.0032*total_no_atoms_i-(joback_slice*transpose(dPc_array)))^-2',catscope);

	}
	return joback_Pc
}

//cm^3/mol

function joback_Vc_fun(catscope){
	var joback_Vc=[];

	for(i=0;i<5;i++){

		var joback_slice=catscope.joback.slice(i*39,(i+1)*39);
		catscope.joback_slice=joback_slice;

        joback_Vc[i]=math.eval('17.5+(joback_slice*transpose(dVc_array))',catscope);

	}
	return joback_Vc
}

function joback_MW_fun(catscope){
	var joback_MW=[];
	for(i=0;i<5;i++){

		var joback_slice=catscope.joback.slice(i*39,(i+1)*39);
		catscope.joback_slice=joback_slice;

		joback_MW[i]=math.eval('joback_slice*transpose(dMW_array)',catscope);
	}
	return joback_MW;
}

function joback_Tr_fun(catscope){
	var joback_Tr=[];

	for(i=0;i<5;i++){

       catscope.joback_Tc_array_i=catscope.joback_Tc_array[i];

        joback_Tr[i]=math.eval('temp/joback_Tc_array_i',catscope);

	}
	return joback_Tr
}

function joback_Tr_273_fun(catscope){
	var joback_Tr_273=[];

	for(i=0;i<5;i++){

       catscope.joback_Tc_array_i=catscope.joback_Tc_array[i];

        joback_Tr_273[i]=math.eval('273.15/joback_Tc_array_i',catscope);

	}
	return joback_Tr_273
}

/////
function pureidealgasdensity_fun(catscope){
  var ideal_gas_density=[];
  for(i=0;i<5;i++){
    catscope.joback_MW_i=catscope.joback_MW_array[i];
    ideal_gas_density[i]=math.eval('pressure*100000*joback_MW_i/8.3145/temp',catscope);
  }
  return ideal_gas_density
}


/////

function thodos_viscosity_fun(catscope){
	var thodos_viscosity_num=[];
	var thodos_viscosity_denom=[];
	var thodos_viscosity=[];

	for(i=0;i<5;i++){

	catscope.joback_Tr_i=catscope.joback_Tr_array[i];
	catscope.joback_Tc_i=catscope.joback_Tc_array[i];
	catscope.joback_MW_i=catscope.joback_MW_array[i];
	catscope.joback_Pc_i=catscope.joback_Pc_array[i];

	thodos_viscosity_num[i]=math.eval('46.1*(joback_Tr_i)^0.618-20.4*exp(-0.449*joback_Tr_i)+19.4*exp(-4.058*joback_Tr_i)+1',catscope);
	thodos_viscosity_denom[i]=math.eval	('2.173*10^11*(joback_Tc_i)^(1/6)*(joback_MW_i)^(-1/2)*((joback_Pc_i)*10^5)^(-2/3)',catscope);

	catscope.thodos_viscosity_num_i=thodos_viscosity_num[i];
	catscope.thodos_viscosity_denom_i=thodos_viscosity_denom[i];

	thodos_viscosity[i]=math.eval('thodos_viscosity_num_i/thodos_viscosity_denom_i',catscope)
	}
	return thodos_viscosity
}

//new method for gas viscosity --> error 2.19%
function licht_viscosity_fun(catscope){

	var licht_viscosity=[];

	for(i=0;i<5;i++){

	catscope.joback_Tr_i=catscope.joback_Tr_array[i];
	catscope.joback_Tc_i=catscope.joback_Tc_array[i];
	catscope.joback_MW_i=catscope.joback_MW_array[i];
	catscope.joback_Pc_i=catscope.joback_Pc_array[i];

	licht_viscosity[i]=math.eval('63*10^-5*((joback_MW_i^3)*((joback_Pc_i*0.986923267)^4)/(joback_Tc_i))^(-1/6)*((joback_Tr_i)^(1.5)/(joback_Tr_i+0.8))',catscope);

	}
	return licht_viscosity
}



function joback_Cp_fun(catscope){
	var joback_Cp_kg=[];
	var joback_Cp_a=[];
	var joback_Cp_b=[];
	var joback_Cp_c=[];
	var joback_Cp_d=[];
	var joback_Cp_mol=[];
	var joback_Cv_mol=[];

	for(i=0;i<5;i++){

		var joback_slice=catscope.joback.slice(i*39,(i+1)*39);
		catscope.joback_slice=joback_slice;

		joback_Cp_a[i]=math.eval('joback_slice*transpose(dCp_a_array)',catscope);
		joback_Cp_b[i]=math.eval('joback_slice*transpose(dCp_b_array)',catscope);
		joback_Cp_c[i]=math.eval('joback_slice*transpose(dCp_c_array)',catscope);
		joback_Cp_d[i]=math.eval('joback_slice*transpose(dCp_d_array)',catscope);

		catscope.joback_Cp_a_i=joback_Cp_a[i];
		catscope.joback_Cp_b_i=joback_Cp_b[i];
		catscope.joback_Cp_c_i=joback_Cp_c[i];
		catscope.joback_Cp_d_i=joback_Cp_d[i];

		 joback_Cp_mol[i]=math.eval('(joback_Cp_a_i)-37.93+((joback_Cp_b_i)+0.21)*temp+((joback_Cp_c_i)-3.91E-4)*temp^2+((joback_Cp_d_i)+2.06E-7)*temp^3',catscope);//J/mol-K

		 catscope.joback_Cp_mol_i=joback_Cp_mol[i]
		 catscope.joback_MW_i=catscope.joback_MW_array[i]

		 joback_Cp_kg[i]=math.eval('joback_Cp_mol_i/(joback_MW_i*10^-3)',catscope); //J/kg-K

		 joback_Cv_mol[i]=math.eval('joback_Cp_mol_i-8.314',catscope); //J/mol-K

	}
	return [joback_Cp_mol,joback_Cp_kg, joback_Cv_mol] ;
}

function stiel_kf_fun(catscope){ //thermalconductivity
	var stiel_kf=[];

	for(i=0;i<5;i++){

        catscope.joback_Cv_mol_i=catscope.joback_Cv_mol_array[i];
		catscope.thodos_viscosity_i=catscope.thodos_viscosity_array[i];
		catscope.joback_MW_i=catscope.joback_MW_array[i]

        stiel_kf[i]=math.eval('(1.15+2.03*(8.314/(joback_Cv_mol_i)))*(thodos_viscosity_i*joback_Cv_mol_i/(joback_MW_i*10^-3))',catscope);

	}
	return stiel_kf
}



function lee_acentric_fun(catscope){
	var lee_Tr_boil=[];
	var lee_acentric_fun1=[];
	var lee_acentric_fun2=[];
	var lee_acentric=[];
	for(i=0;i<5;i++){
		catscope.joback_Pc_i=catscope.joback_Pc_array[i];
		catscope.joback_Tc_i=catscope.joback_Tc_array[i];
    catscope.joback_Tr_i=catscope.joback_Tr_array[i];
		catscope.boiling_point_i=catscope.boiling_point_array[i];

		lee_Tr_boil[i]=math.eval('boiling_point_i/joback_Tc_i',catscope);

		catscope.lee_Tr_boil_i=lee_Tr_boil[i];

		lee_acentric_fun1[i]=math.eval('5.92714-(6.09648/lee_Tr_boil_i)-1.28862*log(lee_Tr_boil_i,e)+0.169347*(lee_Tr_boil_i)^6',catscope);
		lee_acentric_fun2[i]=math.eval('15.2518-(15.6875/lee_Tr_boil_i)-13.4721*log(lee_Tr_boil_i,e)+0.43577*(lee_Tr_boil_i)^6',catscope);

		catscope.lee_acentric_fun1_i=lee_acentric_fun1[i];
		catscope.lee_acentric_fun2_i=lee_acentric_fun2[i];

		lee_acentric[i]=math.eval('(log(1.01325/joback_Pc_i,e)-lee_acentric_fun1_i)/lee_acentric_fun2_i',catscope)

	}
	return lee_acentric
}

//method 2 for acentric equation 2.3.3

function new_acentric_fun(catscope){
	var new_Tr_boil=[];
	var new_acentric_fun1=[];
	var new_acentric_fun2=[];
	var new_acentric=[];
	for(i=0;i<5;i++){
		catscope.joback_Pc_i=catscope.joback_Pc_array[i];
		catscope.joback_Tc_i=catscope.joback_Tc_array[i];
    catscope.joback_Tr_i=catscope.joback_Tr_array[i];
		catscope.boiling_point_i=catscope.boiling_point_array[i];

		new_Tr_boil[i]=math.eval('boiling_point_i/joback_Tc_i',catscope);

		catscope.new_Tr_boil_i=new_Tr_boil[i];

		new_acentric_fun1[i]=math.eval('(-5.97616*(1-new_Tr_boil_i)+1.29874*(1-new_Tr_boil_i)^1.5-0.60394*(1-new_Tr_boil_i)^2.5-1.06841*(1-new_Tr_boil_i)^5)/new_Tr_boil_i',catscope);
		new_acentric_fun2[i]=math.eval('(-5.003365*(1-new_Tr_boil_i)+1.11505*(1-new_Tr_boil_i)^1.5-5.41217*(1-new_Tr_boil_i)^2.5-7.46628*(1-new_Tr_boil_i)^5)/new_Tr_boil_i',catscope);

		catscope.new_acentric_fun1_i=new_acentric_fun1[i];
		catscope.new_acentric_fun2_i=new_acentric_fun2[i];

		new_acentric[i]=math.eval('-(new_acentric_fun1_i+log(joback_Pc_i/1.01325,e))/new_acentric_fun2_i',catscope)

	}
	return new_acentric
}


//


function rackett_density_fun(catscope){
	var rackett_density_calc=[];
	var rackett_density=[];
	var joback_Zc=[];
	for(i=0;i<5;i++){
		catscope.joback_Tc_i=catscope.joback_Tc_array[i];
		catscope.joback_Pc_i=catscope.joback_Pc_array[i];
		catscope.joback_Vc_i=catscope.joback_Vc_array[i];
		catscope.joback_Tr_i=catscope.joback_Tr_array[i];
		catscope.joback_MW_i=catscope.joback_MW_array[i];

		joback_Zc[i]=math.eval('joback_Pc_i*0.986923267*joback_Vc_i/(82.05*joback_Tc_i)',catscope); // (atm * cc/gmole)/(82.05(cc*atm/gmole/K)*K) --> dimensionless
        catscope.joback_Zc_i=joback_Zc[i];


		rackett_density_calc[i]=math.eval('1+(1-joback_Tr_i)^(2/7)',catscope);
		catscope.rackett_density_calc_i=rackett_density_calc[i];

		rackett_density[i]=math.eval('joback_Pc_i*0.986923267*joback_MW_i/(0.082057*joback_Tc_i*(joback_Zc_i)^rackett_density_calc_i)',catscope) //atm * kg/mole / m3·atm·K−1·mol−1*(K)
	}
	return [joback_Zc,rackett_density]
}


//rackett density equation 2 --> can try if the first method is not accurate enough
function rackett_density2_fun(catscope){
  var rackett_density_calc2=[];
  var rackett_density2=[];
	for(i=0;i<5;i++){
		catscope.joback_Tc_i=catscope.joback_Tc_array[i];
		catscope.joback_Pc_i=catscope.joback_Pc_array[i];
		catscope.joback_Vc_i=catscope.joback_Vc_array[i];
		catscope.joback_Tr_i=catscope.joback_Tr_array[i];
		catscope.joback_MW_i=catscope.joback_MW_array[i];

    rackett_density_calc2[i]=math.eval('(1-joback_Tr_i)^(0.280338)',catscope);
    catscope.rackett_density_calc_i=rackett_density_calc[i];

		rackett_density2[i]=math.eval('joback_MW_i*1000/joback_Vc_i*0.257033^-rackett_density_calc_i',catscope) //atm * kg/mole / m3·atm·K−1·mol−1*(K)
	}
	return rackett_density2
}


function rowlinson_Cp_fun(catscope){
    var rowlinson_Cp=[];
    var rowlinson_Cp_mol=[];
    var rowlinson_Cp_calc=[];
    var rowlinson_Cp_kg=[];

    for(i=0;i<5;i++){
        catscope.new_acentric_i=catscope.new_acentric_array[i];
        catscope.joback_Tr_i=catscope.joback_Tr_array[i];
        catscope.joback_Cp_mol_i=catscope.joback_Cp_mol_array[i];
        catscope.joback_MW_i=catscope.joback_MW_array[i];

        rowlinson_Cp_calc[i]=math.eval('0.25*new_acentric_i*(17.11+25.2*(1-joback_Tr_i)^0.33*joback_Tr_i^-1+1.742*(1-joback_Tr_i)^-1)',catscope);
        catscope.rowlinson_Cp_calc_i=rowlinson_Cp_calc[i];

        rowlinson_Cp_mol[i]=math.eval('8.314*(1.45+0.45*(1-joback_Tr_i)^-1+rowlinson_Cp_calc_i)+joback_Cp_mol_i',catscope);
        catscope.rowlinson_Cp_mol_i=rowlinson_Cp_mol[i];

        rowlinson_Cp_kg[i]=math.eval('rowlinson_Cp_mol_i/(joback_MW_i*10^-3)',catscope); //J/kg-K

    }
    return rowlinson_Cp_kg
}

//method 2 for heat capacity

function new_Cp_fun(catscope){ //equation 6.64
    var new_Cp=[];
    var new_Cp_mol=[];
    var new_Cp_calc=[];
    var new_Cp_kg=[];

    for(i=0;i<5;i++){
        catscope.new_acentric_i=catscope.new_acentric_array[i];
        catscope.joback_Tr_i=catscope.joback_Tr_array[i];
        catscope.joback_Cp_mol_i=catscope.joback_Cp_mol_array[i];
        catscope.joback_MW_i=catscope.joback_MW_array[i];

        new_Cp_calc[i]=math.eval('new_acentric_i*(4.2775+6.31*(1-joback_Tr_i)^0.33/joback_Tr_i+0.4355*(1-joback_Tr_i)^-1)',catscope);
        catscope.new_Cp_calc_i=new_Cp_calc[i];

        new_Cp_mol[i]=math.eval('8.314*(1.586+0.49/(1-joback_Tr_i)+new_Cp_calc_i)+joback_Cp_mol_i',catscope);
        catscope.new_Cp_mol_i=new_Cp_mol[i];

        new_Cp_kg[i]=math.eval('new_Cp_mol_i/(joback_MW_i*10^-3)',catscope); //J/kg-K

    }
    return new_Cp_kg
}

//


function stiel_viscosity_fun(catscope){
    var stiel_viscosity=[];
    var stiel_viscosity_calc1=[];
    var stiel_viscosity_calc2=[];
    var stiel_inverse_viscosity=[];

    for(i=0;i<5;i++){
        catscope.joback_Tr_i=catscope.joback_Tr_array[i];
        catscope.joback_Tc_i=catscope.joback_Tc_array[i];
		catscope.joback_Pc_i=catscope.joback_Pc_array[i];
	    catscope.joback_MW_i=catscope.joback_MW_array[i];
	    catscope.lee_acentric_i=catscope.lee_acentric_array[i];

		stiel_viscosity_calc1[i]=math.eval('10^-3*(2.648-3.725*joback_Tr_i+1.309*(joback_Tr_i)^2)',catscope);
		stiel_viscosity_calc2[i]=math.eval('10^-3*(7.425-13.39*joback_Tr_i+5.933*(joback_Tr_i)^2)',catscope);
		stiel_inverse_viscosity[i]=math.eval('0.176*(joback_Tc_i/( joback_MW_i)^3/(joback_Pc_i)^4)^(1/6)',catscope);

		catscope.stiel_viscosity_calc1_i=stiel_viscosity_calc1[i];
		catscope.stiel_viscosity_calc2_i=stiel_viscosity_calc2[i];
		catscope.stiel_inverse_viscosity_i=stiel_inverse_viscosity[i];

		stiel_viscosity[i]=math.eval('(stiel_viscosity_calc1_i+stiel_viscosity_calc2_i*lee_acentric_i)/(stiel_inverse_viscosity_i)/10^3',catscope);

    }
    return stiel_viscosity
}

//method 2 for liquid viscosity
function hiroshi_viscosity_fun(catscope){
    var hiroshi_viscosity=[];
    var hiroshi_viscosity_calc1=[];
    var hiroshi_viscosity_calc2=[];
    var hiroshi_inverse_viscosity=[];

    for(i=0;i<5;i++){
        catscope.joback_Tr_i=catscope.joback_Tr_array[i];
        catscope.joback_Tc_i=catscope.joback_Tc_array[i];
		    catscope.joback_Pc_i=catscope.joback_Pc_array[i];
	      catscope.joback_MW_i=catscope.joback_MW_array[i];
        catscope.new_acentric_i=catscope.new_acentric_array[i];

		hiroshi_viscosity_calc1[i]=math.eval('(0.015174-0.02135*joback_Tr_i+0.0075*(joback_Tr_i)^2)',catscope);
		hiroshi_viscosity_calc2[i]=math.eval('(0.042552-0.07674*joback_Tr_i+0.034*(joback_Tr_i)^2)',catscope);
		hiroshi_inverse_viscosity[i]=math.eval('(joback_Tc_i/( joback_MW_i)^3/(joback_Pc_i)^4)^(1/6)',catscope);

		catscope.hiroshi_viscosity_calc1_i=hiroshi_viscosity_calc1[i];
		catscope.hiroshi_viscosity_calc2_i=hiroshi_viscosity_calc2[i];
		catscope.hiroshi_inverse_viscosity_i=hiroshi_inverse_viscosity[i];

		hiroshi_viscosity[i]=math.eval('(hiroshi_viscosity_calc1_i+hiroshi_viscosity_calc2_i*new_acentric_i)/(hiroshi_inverse_viscosity_i)/10^3',catscope);

    }
    return hiroshi_viscosity
}

///
/// liquid viscosity method 3


///


function baroncini_kf_fun(catscope){
    var baroncini_kf=[];


    for(i=0;i<5;i++){

        if(catscope.baroncini_family_type_array[i] == "Saturated Hydrocarbons"){
      catscope.baroncini_A=0.0035;
      catscope.baroncini_alpha=1.2;
      catscope.baroncini_beta=0.5;
      catscope.baroncini_gamma=0.167;
    } else if(catscope.baroncini_family_type_array[i] == "Olefins"){
        catscope.baroncini_A=0.0361;
        catscope.baroncini_alpha=1.2;
        catscope.baroncini_beta=1;
        catscope.baroncini_gamma=0.167;
    }else if(catscope.baroncini_family_type_array[i] == "Cycloparaffins"){
        catscope.baroncini_A=0.031;
        catscope.baroncini_alpha=1.2;
        catscope.baroncini_beta=1;
        catscope.baroncini_gamma=0.167;
    }else if(catscope.baroncini_family_type_array[i]== "Aromatics"){
        catscope.baroncini_A=0.0346;
        catscope.baroncini_alpha=1.2;
        catscope.baroncini_beta=1;
        catscope.baroncini_gamma=0.167;
    }else if(catscope.baroncini_family_type_array[i] == "Alcohols"){
        catscope.baroncini_A=0.00339;
        catscope.baroncini_alpha=1.2;
        catscope.baroncini_beta=0.5;
        catscope.baroncini_gamma=0.167;
    }else if(catscope.baroncini_family_type_array[i] == "Organic Acids"){
        catscope.baroncini_A=0.00319;
        catscope.baroncini_alpha=1.2;
        catscope.baroncini_beta=0.5;
        catscope.baroncini_gamma=0.167;
    }else if(catscope.baroncini_family_type_array[i] == "Ketones"){
        catscope.baroncini_A=0.00383;
        catscope.baroncini_alpha=1.2;
        catscope.baroncini_beta=0.5;
        catscope.baroncini_gamma=0.167;
    }else if(catscope.baroncini_family_type_array[i] == "Esters"){
        catscope.baroncini_A=0.0415;
        catscope.baroncini_alpha=1.2;
        catscope.baroncini_beta=1;
        catscope.baroncini_gamma=0.167;
    }else if(catscope.baroncini_family_type_array[i]== "Ethers"){
        catscope.baroncini_A=0.0385;
        catscope.baroncini_alpha=1.2;
        catscope.baroncini_beta=1;
        catscope.baroncini_gamma=0.167;
    }else if(catscope.baroncini_family_type_array[i]== "Halogenated Compounds"){
        catscope.baroncini_A=0.528;
        catscope.baroncini_alpha=0;
        catscope.baroncini_beta=0.5;
        catscope.baroncini_gamma=-0.167;
    }else{
      catscope.baroncini_A=0;
      catscope.baroncini_alpha=0;
      catscope.baroncini_beta=0;
      catscope.baroncini_gamma=0;

    }

    catscope.boiling_point_i=catscope.boiling_point_array[i];
    catscope.joback_Tr_i=catscope.joback_Tr_array[i];
    catscope.joback_Tc_i=catscope.joback_Tc_array[i];
    catscope.joback_MW_i=catscope.joback_MW_array[i];

    baroncini_kf[i]=math.eval('baroncini_A*(boiling_point_i)^baroncini_alpha*(joback_MW_i)^-baroncini_beta*(joback_Tc_i)^-baroncini_gamma*(1-joback_Tr_i)^(0.38)*(joback_Tr_i)^(-1/6)',catscope)
    }
    return baroncini_kf
}


function inorganic_acid_fun(catscope){
    var inorganic_acidv=[];
    var inorganic_acidtc=[];
    var inorganic_acidd=[];
    var inorganic_acidhc=[];
    var inorganic_acidhc_calc=[];
    var inorganic_acidhc_mw=[];
    var inorganic_acidct=[];
    var inorganic_acidcp=[];
    var inorganic_acidgasv=[];
    var inorganic_acidgastc=[];
    var inorganic_acidgasd=[];
    var inorganic_acidgashc=[];
    var inorganic_acidgashc_calc=[];
    var inorganic_acidgashc_mw=[];


    for(i=0;i<5;i++){

      catscope.joback_Tr_i=catscope.joback_Tr_array[i];

      if(catscope.inorganic_acid_type_array[i] == "H2O"){
      catscope.viscosity_A=-11.6225;
      catscope.viscosity_B=1948.96;
      catscope.viscosity_C=0.021641;
      catscope.viscosity_D=-0.00001559;

      catscope.thermalconductivity_A=-0.2987;
      catscope.thermalconductivity_B=0.0047054;
      catscope.thermalconductivity_C=-0.0000056209;

      catscope.density_A=0.325;
      catscope.density_B=0.27;
      catscope.density_C=647.13;
      catscope.density_N=0.23;

      catscope.heatcapacity_A=276370;
      catscope.heatcapacity_B=-2090.1;
      catscope.heatcapacity_C=8.125;
      catscope.heatcapacity_D=-0.014116;
      catscope.heatcapacity_E=0.0000093701;

      catscope.molecular_weight=18;

      catscope.crtitcal_temperature=647.13;
      catscope.crtitcal_pressure=220.55;

      catscope.gasviscosity_A=-36.826;
      catscope.gasviscosity_B=0.429;
      catscope.gasviscosity_C=-1.62*0.00001;
      catscope.gasviscosity_D=0;

      catscope.gasthermalconductivity_A=0.00053;
      catscope.gasthermalconductivity_B=4.7093*0.00001;
      catscope.gasthermalconductivity_C= 4.9551*0.00000001;
      catscope.gasthermalconductivity_D=0;

      catscope.gasheatcapacity_A=33.933;
      catscope.gasheatcapacity_B=-8.4186*0.001;
      catscope.gasheatcapacity_C=2.9906*0.00001;
      catscope.gasheatcapacity_D=-1.7825*0.00000001;
      catscope.gasheatcapacity_E=3.6934*0.000000000001;
      catscope.gasheatcapacity_F=0;
      catscope.gasheatcapacity_G=0;

    } else if(catscope.inorganic_acid_type_array[i] == "HCl"){
      catscope.viscosity_A=5.8809;
      catscope.viscosity_B=-608.03;
      catscope.viscosity_C=-0.020288;
      catscope.viscosity_D=0.0000124;

      catscope.thermalconductivity_A=0.4593;
      catscope.thermalconductivity_B=-0.00016539;
      catscope.thermalconductivity_C=-0.0000025781;

      catscope.density_A=0.44651;
      catscope.density_B=0.2729;
      catscope.density_C=324.65;
      catscope.density_N=0.3217;

      catscope.heatcapacity_A=2029.39*36.5;
      catscope.heatcapacity_B=-3.550678*36.5;
      catscope.heatcapacity_C=-2.166171*0.001*36.5;
      catscope.heatcapacity_D=7.243153*0.00001*36.5;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=36.5;

      catscope.crtitcal_temperature=324.65;
      catscope.crtitcal_pressure=83.1;

      catscope.gasviscosity_A=-16.8499;
      catscope.gasviscosity_B=0.598746;
      catscope.gasviscosity_C=-0.000182906;
      catscope.gasviscosity_D=3.83*0.00000001;

      catscope.gasthermalconductivity_A=-0.00274875;
      catscope.gasthermalconductivity_B=6.13*0.00001;
      catscope.gasthermalconductivity_C=-7.97*0.000000001;
      catscope.gasthermalconductivity_D=1.28*0.000000000001;

      catscope.gasheatcapacity_A=27.914285;
      catscope.gasheatcapacity_B=0.0041;
      catscope.gasheatcapacity_C=0;
      catscope.gasheatcapacity_D=0;
      catscope.gasheatcapacity_E=0;
      catscope.gasheatcapacity_F=0;
      catscope.gasheatcapacity_G=0;

    }else if(catscope.inorganic_acid_type_array[i] == "H2SO4"){
      catscope.viscosity_A=-18.7214;
      catscope.viscosity_B=3498.6;
      catscope.viscosity_C=0.033166;
      catscope.viscosity_D=-0.000017039;

      catscope.thermalconductivity_A=0.0142;
      catscope.thermalconductivity_B=0.0010763;
      catscope.thermalconductivity_C=0;

      catscope.density_A=1.4915;
      catscope.density_B=0.79186;
      catscope.density_C=924;
      catscope.density_N=0.2713;

      catscope.heatcapacity_A=265.1319*98;
      catscope.heatcapacity_B=7.171428*98;
      catscope.heatcapacity_C=-1.412731*0.01*98;
      catscope.heatcapacity_D=1.054451*0.00001*98;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=98;

      catscope.crtitcal_temperature=924;
      catscope.crtitcal_pressure=64;

      catscope.gasviscosity_A=3.76564;
      catscope.gasviscosity_B=0.178867;
      catscope.gasviscosity_C=6.00392*0.000001;
      catscope.gasviscosity_D=-1.37848*0.000000001;

      catscope.gasthermalconductivity_A=-0.00353158;
      catscope.gasthermalconductivity_B=3.0385*0.00001;
      catscope.gasthermalconductivity_C=9.07031*0.000000001;
      catscope.gasthermalconductivity_D=-3.36734*0.000000000001;

      catscope.gasheatcapacity_A= 12.03605987;
      catscope.gasheatcapacity_B=0.335062512;
      catscope.gasheatcapacity_C= -0.000355562;
      catscope.gasheatcapacity_D= 1.0221*0.0000001;
      catscope.gasheatcapacity_E=1.21511*0.0000000001;
      catscope.gasheatcapacity_F=-1.07609*0.0000000000001;
      catscope.gasheatcapacity_G=2.5041*0.00000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "SO3"){
      catscope.viscosity_A=-11.3018;
      catscope.viscosity_B=2308.9;
      catscope.viscosity_C=0.015306;
      catscope.viscosity_D=-0.0000083916;

      catscope.thermalconductivity_A=0.9288;
      catscope.thermalconductivity_B=-0.0030803;
      catscope.thermalconductivity_C=0.00000266;

      catscope.density_A=0.63035;
      catscope.density_B=0.19013;
      catscope.density_C=490.85;
      catscope.density_N=0.43590;

      catscope.heatcapacity_A=63259.87*80;
      catscope.heatcapacity_B=-523.34*80;
      catscope.heatcapacity_C=1.493676*80;
      catscope.heatcapacity_D=-1.3885107*0.001*80;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=80;

      catscope.crtitcal_temperature=490.85;
      catscope.crtitcal_pressure=82.1;

      catscope.gasviscosity_A=-16.3126;
      catscope.gasviscosity_B=0.570512;
      catscope.gasviscosity_C=-0.000217815;
      catscope.gasviscosity_D=4.32*0.00000001;

      catscope.gasthermalconductivity_A=-0.00524226;
      catscope.gasthermalconductivity_B=5.88*0.00001;
      catscope.gasthermalconductivity_C=3.93*0.000000001;
      catscope.gasthermalconductivity_D=-9.24*0.000000000001;

      catscope.gasheatcapacity_A=25.85557744;
      catscope.gasheatcapacity_B=0.0744;
      catscope.gasheatcapacity_C=0.000113;
      catscope.gasheatcapacity_D=-3.83*0.0000001;
      catscope.gasheatcapacity_E=4.04*0.0000000001;
      catscope.gasheatcapacity_F=-1.93*0.0000000000001;
      catscope.gasheatcapacity_G=3.55*0.00000000000000001;

    }else if(catscope.inorganic_acid_type_array[i] == "H2S"){
      catscope.viscosity_A=-1.9965;
      catscope.viscosity_B=335.38;
      catscope.viscosity_C=-0.00019696;
      catscope.viscosity_D=0.00000012306;

      catscope.thermalconductivity_A=0.4842;
      catscope.thermalconductivity_B=-0.001184;
      catscope.thermalconductivity_C=0;

      catscope.density_A=0.34459;
      catscope.density_B=0.27369;
      catscope.density_C=373.53;
      catscope.density_N=0.29015;

      catscope.heatcapacity_A=-7574.847*34;
      catscope.heatcapacity_B=115.8087*34;
      catscope.heatcapacity_C=-0.48418*34;
      catscope.heatcapacity_D=6.93845996*0.0001*34;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=34;

      catscope.crtitcal_temperature=373.53;
      catscope.crtitcal_pressure=89.63;

      catscope.gasviscosity_A=192.146;
      catscope.gasviscosity_B=-0.398545;
      catscope.gasviscosity_C=0.000965059;
      catscope.gasviscosity_D=-2.82*0.0000001;

      catscope.gasthermalconductivity_A=0.00311835;
      catscope.gasthermalconductivity_B=3.52*0.00001;
      catscope.gasthermalconductivity_C=4.42*0.00000001;
      catscope.gasthermalconductivity_D=-1.48*0.00000000001;

      catscope.gasheatcapacity_A=29.75404733;
      catscope.gasheatcapacity_B=0.0149;
      catscope.gasheatcapacity_C=0;
      catscope.gasheatcapacity_D=0;
      catscope.gasheatcapacity_E=0;
      catscope.gasheatcapacity_F=0;
      catscope.gasheatcapacity_G=0;

    }else if(catscope.inorganic_acid_type_array[i] == "HF"){
      catscope.viscosity_A=-6.6469;
      catscope.viscosity_B=912.64;
      catscope.viscosity_C=0.012219;
      catscope.viscosity_D=-0.00000838;

      catscope.thermalconductivity_A=0.7516;
      catscope.thermalconductivity_B=-0.0010874;
      catscope.thermalconductivity_C=0;

      catscope.density_A=0.29041;
      catscope.density_B=0.1766;
      catscope.density_C=461.15;
      catscope.density_N=0.3733;

      catscope.heatcapacity_A=62520;
      catscope.heatcapacity_B=-223.02;
      catscope.heatcapacity_C=0.6297;
      catscope.heatcapacity_D=0;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=20;

      catscope.crtitcal_temperature=461.15;
      catscope.crtitcal_pressure=64.8;

      catscope.gasviscosity_A=-172.644;
      catscope.gasviscosity_B=1.05594;
      catscope.gasviscosity_C=-0.000812232;
      catscope.gasviscosity_D=7.83*0.0000001;

      catscope.gasthermalconductivity_A=-0.00170925;
      catscope.gasthermalconductivity_B=6.39*0.00001;
      catscope.gasthermalconductivity_C=2.8*0.00000001;
      catscope.gasthermalconductivity_D=-1.24*0.00000000001;

      catscope.gasheatcapacity_A=28.41173544;
      catscope.gasheatcapacity_B=0.0024;
      catscope.gasheatcapacity_C=0;
      catscope.gasheatcapacity_D=0;
      catscope.gasheatcapacity_E=0;
      catscope.gasheatcapacity_F=0;
      catscope.gasheatcapacity_G=0;

    }else if(catscope.inorganic_acid_type_array[i] == "HCN"){
      catscope.viscosity_A=23.1072;
      catscope.viscosity_B=-2397.7;
      catscope.viscosity_C=-0.072644;
      catscope.viscosity_D=0.000065607;

      catscope.thermalconductivity_A=0.3333;
      catscope.thermalconductivity_B=0.0000015737;
      catscope.thermalconductivity_C=-0.0000012143;

      catscope.density_A=0.19501;
      catscope.density_B=0.18589;
      catscope.density_C=456.65;
      catscope.density_N=0.28206;

      catscope.heatcapacity_A=95398;
      catscope.heatcapacity_B=-197.52;
      catscope.heatcapacity_C=0.3883;
      catscope.heatcapacity_D=0;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=27;

      catscope.crtitcal_temperature=456.65;
      catscope.crtitcal_pressure=53.91;

      catscope.gasviscosity_A=-181.384;
      catscope.gasviscosity_B=1.65007;
      catscope.gasviscosity_C=-0.00189725;
      catscope.gasviscosity_D=0;

      catscope.gasthermalconductivity_A=-0.0244549;
      catscope.gasthermalconductivity_B=0.00018827;
      catscope.gasthermalconductivity_C=6.03*0.00000001;
      catscope.gasthermalconductivity_D=-3.85*0.0000000001;

      catscope.gasheatcapacity_A=27.10796283;
      catscope.gasheatcapacity_B=0.0095;
      catscope.gasheatcapacity_C=0.000142;
      catscope.gasheatcapacity_D=-3.47*0.0000001;
      catscope.gasheatcapacity_E=3.68*0.0000000001;
      catscope.gasheatcapacity_F=-1.85*0.0000000000001;
      catscope.gasheatcapacity_G=3.58*0.00000000000000001;

    }else if(catscope.inorganic_acid_type_array[i]== "HNO3"){
      catscope.viscosity_A=-3.426;
      catscope.viscosity_B=719.6;
      catscope.viscosity_C=0.0036519;
      catscope.viscosity_D=-0.0000019024;

      catscope.thermalconductivity_A=0.1211;
      catscope.thermalconductivity_B=0.0005383;
      catscope.thermalconductivity_C=0;

      catscope.density_A=1.37243;
      catscope.density_B=0.83561;
      catscope.density_C=520;
      catscope.density_N=0.19330;

      catscope.heatcapacity_A=3402.7168*63;
      catscope.heatcapacity_B=-12.181954*63;
      catscope.heatcapacity_C=2.375704*0.01*63;
      catscope.heatcapacity_D=-4.79394*0.000001*63;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=63;

      catscope.crtitcal_temperature=520;
      catscope.crtitcal_pressure=68.9;

      catscope.gasviscosity_A=-11.5389;
      catscope.gasviscosity_B=0.377158;
      catscope.gasviscosity_C=-9.73016*0.00001;
      catscope.gasviscosity_D=1.96683*0.00000001;

      catscope.gasthermalconductivity_A=-0.00376064;
      catscope.gasthermalconductivity_B=4.7737*0.00001;
      catscope.gasthermalconductivity_C=2.18879*0.00000001;
      catscope.gasthermalconductivity_D=-9.97479*0.000000000001;

      catscope.gasheatcapacity_A=29.13605;
      catscope.gasheatcapacity_B=0.00904285;
      catscope.gasheatcapacity_C= 0.000488715;
      catscope.gasheatcapacity_D= -1.11262*0.000001;
      catscope.gasheatcapacity_E=1.10271*0.000000001;
      catscope.gasheatcapacity_F=-5.23348*0.0000000000001;
      catscope.gasheatcapacity_G=9.67869*0.00000000000000001;

    }else if(catscope.inorganic_acid_type_array[i]== "NH3"){
      catscope.viscosity_A=1.2055;
      catscope.viscosity_B=-74.539;
      catscope.viscosity_C=-0.0062862;
      catscope.viscosity_D=0.00000086771;

      catscope.thermalconductivity_A=1.169;
      catscope.thermalconductivity_B=-0.002314;
      catscope.thermalconductivity_C=0;

      catscope.density_A=0.23684;
      catscope.density_B=0.25443;
      catscope.density_C=405.65;
      catscope.density_N=0.2888;

      catscope.heatcapacity_A=-27826.08*17;
      catscope.heatcapacity_B=348.38999*17;
      catscope.heatcapacity_C=-1.261995*17;
      catscope.heatcapacity_D=1.543222*0.001*17;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=17;

      catscope.crtitcal_temperature=405.65;
      catscope.crtitcal_pressure=112.8;

      catscope.gasviscosity_A=-7.874;
      catscope.gasviscosity_B=0.367;
      catscope.gasviscosity_C=-4.47*0.000001;
      catscope.gasviscosity_D=0;

      catscope.gasthermalconductivity_A= 0.00457;
      catscope.gasthermalconductivity_B= 2.3239*0.00001;
      catscope.gasthermalconductivity_C= 1.481*0.0000001;
      catscope.gasthermalconductivity_D=0;

      catscope.gasheatcapacity_A=33.573;
      catscope.gasheatcapacity_B=-1.2581*0.01;
      catscope.gasheatcapacity_C=8.8906*0.00001;
      catscope.gasheatcapacity_D=-7.1783*0.00000001;
      catscope.gasheatcapacity_E=1.8569*0.00000000001;
      catscope.gasheatcapacity_F=0;
      catscope.gasheatcapacity_G=0;


    }else if(catscope.inorganic_acid_type_array[i]== "CH3OH"){
      catscope.viscosity_A=-9.0562;
      catscope.viscosity_B=1.2542*1000;
      catscope.viscosity_C=0.0224;
      catscope.viscosity_D=-2.3528*0.00001;

      catscope.thermalconductivity_A=0.2522;
      catscope.thermalconductivity_B=-6.9135*0.000001;
      catscope.thermalconductivity_C=-5.3801*0.0000001;

      catscope.density_A=0.27197;
      catscope.density_B=0.27192;
      catscope.density_C=512.58;
      catscope.density_N=0.23310;

      catscope.heatcapacity_A=40152;
      catscope.heatcapacity_B=3.1046*100;
      catscope.heatcapacity_C=-1.0291;
      catscope.heatcapacity_D=1.4598*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=32;

      catscope.crtitcal_temperature=512.58;
      catscope.crtitcal_pressure=80.96;

      catscope.gasviscosity_A=-13.6155;
      catscope.gasviscosity_B=0.385116;
      catscope.gasviscosity_C=-5.5*0.00001;
      catscope.gasviscosity_D=-4.2*0.000000001;

      catscope.gasthermalconductivity_A=-0.0186826;
      catscope.gasthermalconductivity_B=8.8*0.00001;
      catscope.gasthermalconductivity_C=8.23*0.00000001;
      catscope.gasthermalconductivity_D=-2.89*0.00000000001;

      catscope.gasheatcapacity_A=52.358788;
      catscope.gasheatcapacity_B=-0.202;
      catscope.gasheatcapacity_C=0.000942;
      catscope.gasheatcapacity_D=-1.54*0.000001;
      catscope.gasheatcapacity_E=1.29*0.000000001;
      catscope.gasheatcapacity_F=-5.56*0.0000000000001;
      catscope.gasheatcapacity_G=9.63*0.00000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "C2H5OH"){
      catscope.viscosity_A=-6.4406;
      catscope.viscosity_B=1117.6;
      catscope.viscosity_C=0.013721;
      catscope.viscosity_D=-1.5465*0.00001;

      catscope.thermalconductivity_A=0.2246;
      catscope.thermalconductivity_B=-5.633*0.00001;
      catscope.thermalconductivity_C=-4.2178*0.0000001;

      catscope.density_A=0.26570;
      catscope.density_B=0.26395;
      catscope.density_C=516.25;
      catscope.density_N=0.23670;

      catscope.heatcapacity_A=59342;
      catscope.heatcapacity_B=363.58;
      catscope.heatcapacity_C=-1.2164;
      catscope.heatcapacity_D=1.803*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=46;

      catscope.crtitcal_temperature=400.1;
      catscope.crtitcal_pressure=53.7;

      catscope.gasviscosity_A=1.80855;
      catscope.gasviscosity_B=0.305038;
      catscope.gasviscosity_C=-3.98*0.00001;
      catscope.gasviscosity_D=-2.58*0.000000001;

      catscope.gasthermalconductivity_A=-0.013405;
      catscope.gasthermalconductivity_B=7.02*0.00001;
      catscope.gasthermalconductivity_C=9.01*0.00000001;
      catscope.gasthermalconductivity_D=-3.7*0.00000000001;

      catscope.gasheatcapacity_A=53.777;
      catscope.gasheatcapacity_B=-0.207;
      catscope.gasheatcapacity_C=0.001422;
      catscope.gasheatcapacity_D=-2.63*0.000001;
      catscope.gasheatcapacity_E=2.4*0.000000001;
      catscope.gasheatcapacity_F=-1.09*0.000000000001;
      catscope.gasheatcapacity_G=1.96*0.0000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "C3H7OH"){
      catscope.viscosity_A=-3.7702;
      catscope.viscosity_B= 991.51;
      catscope.viscosity_C= 4.0836*0.001;
      catscope.viscosity_D=-5.4586*0.000001;

      catscope.thermalconductivity_A=0.187;
      catscope.thermalconductivity_B=-1.1479*0.00001;
      catscope.thermalconductivity_C=-3.0933*0.0000001;

      catscope.density_A=0.27684;
      catscope.density_B=0.27200;
      catscope.density_C=536.71;
      catscope.density_N=0.24940;

      catscope.heatcapacity_A=88080;
      catscope.heatcapacity_B=402.24;
      catscope.heatcapacity_C=-1.3032;
      catscope.heatcapacity_D=1.9677*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=60;

      catscope.crtitcal_temperature=536.71;
      catscope.crtitcal_pressure=51.7;

      catscope.gasviscosity_A=-15.6072;
      catscope.gasviscosity_B=0.327179;
      catscope.gasviscosity_C=-6.87*0.00001;
      catscope.gasviscosity_D=5.94*0.000000001;

      catscope.gasthermalconductivity_A=-0.000892762;
      catscope.gasthermalconductivity_B=2.7*0.00001;
      catscope.gasthermalconductivity_C=1.03*0.0000001;
      catscope.gasthermalconductivity_D=-3.64*0.00000000001;

      catscope.gasheatcapacity_A=63.7988;
      catscope.gasheatcapacity_B=-0.24;
      catscope.gasheatcapacity_C=0.00183;
      catscope.gasheatcapacity_D=-3.43*0.000001;
      catscope.gasheatcapacity_E=3.14*0.000000001;
      catscope.gasheatcapacity_F=-1.43*0.000000000001;
      catscope.gasheatcapacity_G=2.59*0.0000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "n-Butanol"){
      catscope.viscosity_A=-5.3970;
      catscope.viscosity_B=1.3256E+03;
      catscope.viscosity_C=6.2223*0.001;
      catscope.viscosity_D=-5.5062*0.000001;

      catscope.thermalconductivity_A=0.1871;
      catscope.thermalconductivity_B=-1.1797*0.00001;
      catscope.thermalconductivity_C=-3.1997*0.0000001;

      catscope.density_A=0.26891;
      catscope.density_B=0.26674;
      catscope.density_C=562.93;
      catscope.density_N=0.24570;

      catscope.heatcapacity_A=127210;
      catscope.heatcapacity_B=522.81;
      catscope.heatcapacity_C=-1.5362;
      catscope.heatcapacity_D=2.2164*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=74.121;

      catscope.crtitcal_temperature=562.93;
      catscope.crtitcal_pressure=44.13;

      catscope.gasviscosity_A=-7.34326;
      catscope.gasviscosity_B=0.277629;
      catscope.gasviscosity_C=-4.52*0.00001;
      catscope.gasviscosity_D=9.19*0.0000000001;

      catscope.gasthermalconductivity_A=-0.000526092;
      catscope.gasthermalconductivity_B=3.03*0.00001;
      catscope.gasthermalconductivity_C=9.78*0.00000001;
      catscope.gasthermalconductivity_D=-3.48*0.00000000001;

      catscope.gasheatcapacity_A=70.6295494;
      catscope.gasheatcapacity_B=-0.264;
      catscope.gasheatcapacity_C=0.002322;
      catscope.gasheatcapacity_D=-4.5*0.000001;
      catscope.gasheatcapacity_E=4.2*0.000000001;
      catscope.gasheatcapacity_F=-1.94*0.000000000001;
      catscope.gasheatcapacity_G=3.54*0.0000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "Ethylene glycol"){
      catscope.viscosity_A=-16.9728;
      catscope.viscosity_B=3.1886E+03;
      catscope.viscosity_C= 3.2537*0.01;
      catscope.viscosity_D=-2.4480*0.00001;

      catscope.thermalconductivity_A=0.093;
      catscope.thermalconductivity_B=0.000910833;
      catscope.thermalconductivity_C=-1.20833*0.000001;

      catscope.density_A=0.32503;
      catscope.density_B=0.25499;
      catscope.density_C=645;
      catscope.density_N=0.17200;

      catscope.heatcapacity_A=75878;
      catscope.heatcapacity_B=641.82;
      catscope.heatcapacity_C=-1.6493;
      catscope.heatcapacity_D=1.6937*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=62;

      catscope.crtitcal_temperature=645;
      catscope.crtitcal_pressure=75.3;

      catscope.gasviscosity_A=-3.65363;
      catscope.gasviscosity_B=0.246744;
      catscope.gasviscosity_C=-9.6*0.000001;
      catscope.gasviscosity_D=-1.04*0.00000001;

      catscope.gasthermalconductivity_A=-0.00092888;
      catscope.gasthermalconductivity_B=8.82*0.000001;
      catscope.gasthermalconductivity_C=4.94*0.00000001;
      catscope.gasthermalconductivity_D=-1.81*0.00000000001;

      catscope.gasheatcapacity_A=58.1943614;
      catscope.gasheatcapacity_B=-0.173;
      catscope.gasheatcapacity_C=0.001533;
      catscope.gasheatcapacity_D=-3.01*0.000001;
      catscope.gasheatcapacity_E=2.86*0.000000001;
      catscope.gasheatcapacity_F=-1.35*0.000000000001;
      catscope.gasheatcapacity_G=2.53*0.0000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "Propylene glycol"){
      catscope.viscosity_A=-29.492;
      catscope.viscosity_B=5.2456*1000;
      catscope.viscosity_C=0.0582;
      catscope.viscosity_D=-4.2343*0.00001;

      catscope.thermalconductivity_A=0.203;
      catscope.thermalconductivity_B=3.3988*0.00001;
      catscope.thermalconductivity_C=-1.3231*0.0000001;

      catscope.density_A=0.3184;
      catscope.density_B=0.2611;
      catscope.density_C=626;
      catscope.density_N=0.2046;

      catscope.heatcapacity_A=118614;
      catscope.heatcapacity_B=672.83;
      catscope.heatcapacity_C=-1.8377;
      catscope.heatcapacity_D=2.1303*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=76;

      catscope.crtitcal_temperature=626;
      catscope.crtitcal_pressure=61;

      catscope.gasviscosity_A=-4.8283;
      catscope.gasviscosity_B=0.271101;
      catscope.gasviscosity_C=-1.85*0.00001;
      catscope.gasviscosity_D=-8.55*0.000000001;

      catscope.gasthermalconductivity_A=-0.00132535;
      catscope.gasthermalconductivity_B=1.18*0.00001;
      catscope.gasthermalconductivity_C=5*0.00000001;
      catscope.gasthermalconductivity_D=-1.76*0.00000000001;

      catscope.gasheatcapacity_A=127.721472;
      catscope.gasheatcapacity_B=-0.7116298;
      catscope.gasheatcapacity_C=0.003585;
      catscope.gasheatcapacity_D=-6.57*0.000001;
      catscope.gasheatcapacity_E=6.08*0.000000001;
      catscope.gasheatcapacity_F=-2.81*0.000000000001;
      catscope.gasheatcapacity_G=5.14*0.0000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "Diethylene glycol"){
      catscope.viscosity_A=-14.794;
      catscope.viscosity_B=3.1502*1000;
      catscope.viscosity_C=0.0235;
      catscope.viscosity_D=-1.4786*0.00001;

      catscope.thermalconductivity_A=0.1933;
      catscope.thermalconductivity_B=2.1241*0.00001;
      catscope.thermalconductivity_C=6.8749*0.00000001;

      catscope.density_A=0.3401;
      catscope.density_B=0.2611;
      catscope.density_C=744.6;
      catscope.density_N=0.2422;

      catscope.heatcapacity_A=126618;
      catscope.heatcapacity_B=855.87;
      catscope.heatcapacity_C=-1.9468;
      catscope.heatcapacity_D=1.8725*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=106;

      catscope.crtitcal_temperature=744.6;
      catscope.crtitcal_pressure=46;

      catscope.gasviscosity_A=0.76388;
      catscope.gasviscosity_B=0.253967;
      catscope.gasviscosity_C=2.89*0.00001;
      catscope.gasviscosity_D=-2.43*0.00000001;

      catscope.gasthermalconductivity_A=0.00194357;
      catscope.gasthermalconductivity_B=1.57*0.00001;
      catscope.gasthermalconductivity_C=9.92*0.00000001;
      catscope.gasthermalconductivity_D=-3.53*0.00000000001;

      catscope.gasheatcapacity_A=43.2268257;
      catscope.gasheatcapacity_B=0.2174855;
      catscope.gasheatcapacity_C=0.000654;
      catscope.gasheatcapacity_D=-1.56*0.000001;
      catscope.gasheatcapacity_E=1.5*0.000000001;
      catscope.gasheatcapacity_F=-7.07*0.0000000000001;
      catscope.gasheatcapacity_G=1.33*0.0000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "Triethylene glycol"){
      catscope.viscosity_A=-13.888;
      catscope.viscosity_B=3.0642*1000;
      catscope.viscosity_C=0.0205;
      catscope.viscosity_D=-1.05*0.00001;

      catscope.thermalconductivity_A=0.1954;
      catscope.thermalconductivity_B=3.0290*0.00001;
      catscope.thermalconductivity_C=-8.4329*0.00000001;

      catscope.density_A=0.339;
      catscope.density_B=0.2607;
      catscope.density_C=700;
      catscope.density_N=0.2096;

      catscope.heatcapacity_A=160250;
      catscope.heatcapacity_B=1207;
      catscope.heatcapacity_C=-3.0636;
      catscope.heatcapacity_D=3.2418*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=150.17;

      catscope.crtitcal_temperature=700;
      catscope.crtitcal_pressure=33.2;

      catscope.gasviscosity_A=-0.972528;
      catscope.gasviscosity_B=0.182687;
      catscope.gasviscosity_C=8.45*0.000001;
      catscope.gasviscosity_D=-1.32*0.00000001;

      catscope.gasthermalconductivity_A=0.00350888;
      catscope.gasthermalconductivity_B=5.79*0.000001;
      catscope.gasthermalconductivity_C=2.42*0.00000001;
      catscope.gasthermalconductivity_D=-8.63*0.000000000001;

      catscope.gasheatcapacity_A=75.98873848;
      catscope.gasheatcapacity_B=0.1169672;
      catscope.gasheatcapacity_C=0.001776;
      catscope.gasheatcapacity_D=-3.85*0.000001;
      catscope.gasheatcapacity_E=3.72*0.000000001;
      catscope.gasheatcapacity_F=-1.76*0.000000000001;
      catscope.gasheatcapacity_G=3.28*0.0000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "Aniline"){
      catscope.viscosity_A=-13.8625;
      catscope.viscosity_B=2.5109E+03;
      catscope.viscosity_C=2.5681*0.01;
      catscope.viscosity_D=-1.8281*0.00001;

      catscope.thermalconductivity_A=0.1962;
      catscope.thermalconductivity_B=-5.3129*0.0000001;
      catscope.thermalconductivity_C=-2.446*0.0000001;

      catscope.density_A=0.31190;
      catscope.density_B=0.25;
      catscope.density_C=699;
      catscope.density_N=0.28571;

      catscope.heatcapacity_A=46948;
      catscope.heatcapacity_B=9.8960*100;
      catscope.heatcapacity_C=-2.3583;
      catscope.heatcapacity_D=2.3296*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=93.13;

      catscope.crtitcal_temperature=199;
      catscope.crtitcal_pressure=53.09;

      catscope.gasviscosity_A=-1.23756;
      catscope.gasviscosity_B=0.224818;
      catscope.gasviscosity_C=1.01*0.00001;
      catscope.gasviscosity_D=-1.62*0.00000001;

      catscope.gasthermalconductivity_A=-0.00573407;
      catscope.gasthermalconductivity_B=2.92*0.00001;
      catscope.gasthermalconductivity_C=8.46*0.00000001;
      catscope.gasthermalconductivity_D=-3.07*0.00000000001;

      catscope.gasheatcapacity_A=28.80117653;
      catscope.gasheatcapacity_B=-0.0063176;
      catscope.gasheatcapacity_C=0.001776;
      catscope.gasheatcapacity_D=-3.88*0.000001;
      catscope.gasheatcapacity_E=3.78*0.000000001;
      catscope.gasheatcapacity_F=-1.78*0.000000000001;
      catscope.gasheatcapacity_G=3.27*0.0000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "Monoethanolamine"){
      catscope.viscosity_A=-13.182;
      catscope.viscosity_B=2.8596*1000;
      catscope.viscosity_C=0.0208;
      catscope.viscosity_D=-1.423*0.00001;

      catscope.thermalconductivity_A=0.2985;
      catscope.thermalconductivity_B=-6.6781*0.00001;
      catscope.thermalconductivity_C=-3.5331*0.0000001;

      catscope.density_A=0.2715;
      catscope.density_B=0.2241;
      catscope.density_C=638;
      catscope.density_N=0.2015;

      catscope.heatcapacity_A=125185;
      catscope.heatcapacity_B=579.79;
      catscope.heatcapacity_C=-1.5031;
      catscope.heatcapacity_D=1.8061*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=61.08;

      catscope.crtitcal_temperature=638;
      catscope.crtitcal_pressure=68.7;

      catscope.gasviscosity_A=-3.20144;
      catscope.gasviscosity_B=0.200941;
      catscope.gasviscosity_C=-9.99793*0.000001;
      catscope.gasviscosity_D=-7.688957*0.000000001;

      catscope.gasthermalconductivity_A=-0.00168879;
      catscope.gasthermalconductivity_B=1.38495*0.00001;
      catscope.gasthermalconductivity_C=5.6356*0.00000001;
      catscope.gasthermalconductivity_D=-1.96787*0.00000000001;

      catscope.gasheatcapacity_A=-5.55*0.1;
      catscope.gasheatcapacity_B=3.7003*0.1;
      catscope.gasheatcapacity_C=-3.1976*0.0001;
      catscope.gasheatcapacity_D=1.583*0.0000001;
      catscope.gasheatcapacity_E=-3.2344*0.00000000001;
      catscope.gasheatcapacity_F=0;
      catscope.gasheatcapacity_G=0;


    }else if(catscope.inorganic_acid_type_array[i]== "Diethanolamine"){
      catscope.viscosity_A=-27.939;
      catscope.viscosity_B=5.9547*1000;
      catscope.viscosity_C=0.0441;
      catscope.viscosity_D=-2.5871*0.00001;

      catscope.thermalconductivity_A=0.2011;
      catscope.thermalconductivity_B=-2.6739*0.00001;
      catscope.thermalconductivity_C=-2.6681*0.0000001;

      catscope.density_A=0.3013;
      catscope.density_B=0.2397;
      catscope.density_C=715;
      catscope.density_N=0.1892;

      catscope.heatcapacity_A=76703;
      catscope.heatcapacity_B=1082.1;
      catscope.heatcapacity_C=-2.486;
      catscope.heatcapacity_D=2.2497*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=105.14;

      catscope.crtitcal_temperature=715;
      catscope.crtitcal_pressure=32.7;

      catscope.gasviscosity_A=-0.402222;
      catscope.gasviscosity_B=0.156346;
      catscope.gasviscosity_C=1.08268*0.00001;
      catscope.gasviscosity_D=-1.25782*0.00000001;

      catscope.gasthermalconductivity_A=-0.00083944;
      catscope.gasthermalconductivity_B=7.29848*0.000001;
      catscope.gasthermalconductivity_C=3.47851*0.00000001;
      catscope.gasthermalconductivity_D=-1.19117*0.00000000001;

      catscope.gasheatcapacity_A=-5.264;
      catscope.gasheatcapacity_B=6.1929*0.1;
      catscope.gasheatcapacity_C=-4.9545*0.0001;
      catscope.gasheatcapacity_D=2.179*0.0000001;
      catscope.gasheatcapacity_E=-3.8987*0.00000000001;
      catscope.gasheatcapacity_F=0;
      catscope.gasheatcapacity_G=0;


    }else if(catscope.inorganic_acid_type_array[i]== "Triethanolamine"){
      catscope.viscosity_A=-21.008;
      catscope.viscosity_B=4.7935*1000;
      catscope.viscosity_C=0.0313;
      catscope.viscosity_D=-1.7784*0.00001;

      catscope.thermalconductivity_A=0.2;
      catscope.thermalconductivity_B=3.9647*0.00001;
      catscope.thermalconductivity_C=-1.8958*0.0000001;

      catscope.density_A=0.3161;
      catscope.density_B=0.248;
      catscope.density_C=787;
      catscope.density_N=0.2035;

      catscope.heatcapacity_A=256171;
      catscope.heatcapacity_B=884.23;
      catscope.heatcapacity_C=-2.0352;
      catscope.heatcapacity_D=2.0205*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=149.188;

      catscope.crtitcal_temperature=787;
      catscope.crtitcal_pressure=24.5;

      catscope.gasviscosity_A=1.48764;
      catscope.gasviscosity_B=0.132255;
      catscope.gasviscosity_C=2.31822*0.00001;
      catscope.gasviscosity_D=-1.53728*0.00000001;

      catscope.gasthermalconductivity_A=-0.000816056;
      catscope.gasthermalconductivity_B=6.25183*0.000001;
      catscope.gasthermalconductivity_C=3.00459*0.00000001;
      catscope.gasthermalconductivity_D=-1.0875*0.00000000001;

      catscope.gasheatcapacity_A=37.73;
      catscope.gasheatcapacity_B=4.9155*0.1;
      catscope.gasheatcapacity_C=3.5952*0.0001;
      catscope.gasheatcapacity_D=-8.229*0.0000001;
      catscope.gasheatcapacity_E=3.5374*0.0000000001;
      catscope.gasheatcapacity_F=0;
      catscope.gasheatcapacity_G=0;


    }else if(catscope.inorganic_acid_type_array[i]== "Methyl diethanolamine"){
      catscope.viscosity_A=-18.285;
      catscope.viscosity_B=3.7119*1000;
      catscope.viscosity_C=0.0326;
      catscope.viscosity_D=-2.2985*0.00001;

      catscope.thermalconductivity_A=0.1966;
      catscope.thermalconductivity_B=-4.1918*0.00001;
      catscope.thermalconductivity_C=-2.7032*0.0000001;

      catscope.density_A=0.3225;
      catscope.density_B=0.2543;
      catscope.density_C=678;
      catscope.density_N=0.2857;

      catscope.heatcapacity_A=183050;
      catscope.heatcapacity_B=1230;
      catscope.heatcapacity_C=-3.1521;
      catscope.heatcapacity_D=3.558*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=119.163;

      catscope.crtitcal_temperature=678;
      catscope.crtitcal_pressure=38.8;

      catscope.gasviscosity_A=-1.38141;
      catscope.gasviscosity_B=0.149471;
      catscope.gasviscosity_C=1.83518*0.000001;
      catscope.gasviscosity_D=-9.0405*0.000000001;

      catscope.gasthermalconductivity_A=-0.000558967;
      catscope.gasthermalconductivity_B=5.8081*0.000001;
      catscope.gasthermalconductivity_C=1.99975*0.00000001;
      catscope.gasthermalconductivity_D=-6.91068*0.000000000001;

      catscope.gasheatcapacity_A=-16.817;
      catscope.gasheatcapacity_B=7.4349*0.1;
      catscope.gasheatcapacity_C=-5.5635*0.0001;
      catscope.gasheatcapacity_D=2.154*0.0000001;
      catscope.gasheatcapacity_E=-3.4622*0.00000000001;
      catscope.gasheatcapacity_F=0;
      catscope.gasheatcapacity_G=0;


    }else if(catscope.inorganic_acid_type_array[i]== "Phenol"){
      catscope.viscosity_A=1.5349;
      catscope.viscosity_B=426.2;
      catscope.viscosity_C=-0.0092;
      catscope.viscosity_D=6.2322*0.000001;

      catscope.thermalconductivity_A=0.1551;
      catscope.thermalconductivity_B=7.8622*0.00001;
      catscope.thermalconductivity_C=-2.3244*0.0000001;

      catscope.density_A=0.411;
      catscope.density_B=0.3175;
      catscope.density_C=694.25;
      catscope.density_N=0.3212;

      catscope.heatcapacity_A=38622;
      catscope.heatcapacity_B=1098.3;
      catscope.heatcapacity_C=-2.4897;
      catscope.heatcapacity_D=2.2802*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=94.11;

      catscope.crtitcal_temperature=694.25;
      catscope.crtitcal_pressure=61.3;

      catscope.gasviscosity_A=-1.82232;
      catscope.gasviscosity_B=0.286449;
      catscope.gasviscosity_C=1.07*0.00001;
      catscope.gasviscosity_D=-1.99*0.00000001;

      catscope.gasthermalconductivity_A=-0.00711284;
      catscope.gasthermalconductivity_B=3.73*0.00001;
      catscope.gasthermalconductivity_C=9.43*0.00000001;
      catscope.gasthermalconductivity_D=-3.44*0.00000000001;

      catscope.gasheatcapacity_A=26.91730132;
      catscope.gasheatcapacity_B=0.00193377;
      catscope.gasheatcapacity_C=0.001683;
      catscope.gasheatcapacity_D=-3.74*0.000001;
      catscope.gasheatcapacity_E=3.68*0.000000001;
      catscope.gasheatcapacity_F=-1.74*0.000000000001;
      catscope.gasheatcapacity_G=3.22*0.0000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "Diphenyl oxide"){
      catscope.viscosity_A=-7.6018;
      catscope.viscosity_B=1.5551*1000;
      catscope.viscosity_C=0.0126;
      catscope.viscosity_D=-9.1364*0.000001;

      catscope.thermalconductivity_A=0.1614;
      catscope.thermalconductivity_B=-1.5223*0.00001;
      catscope.thermalconductivity_C=-1.6472*0.0000001;

      catscope.density_A=0.3431;
      catscope.density_B=0.276;
      catscope.density_C=763;
      catscope.density_N=0.2666;

      catscope.heatcapacity_A=109032;
      catscope.heatcapacity_B=1192;
      catscope.heatcapacity_C=-2.5769;
      catscope.heatcapacity_D=2.296*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=170.2;

      catscope.crtitcal_temperature=763;
      catscope.crtitcal_pressure=31.3;

      catscope.gasviscosity_A=-4.29268;
      catscope.gasviscosity_B=0.215639;
      catscope.gasviscosity_C=-4.54*0.00001;
      catscope.gasviscosity_D=1.14*0.00000001;

      catscope.gasthermalconductivity_A=-0.00433049;
      catscope.gasthermalconductivity_B=2.06*0.00001;
      catscope.gasthermalconductivity_C=7.2*0.00000001;
      catscope.gasthermalconductivity_D=-2.62*0.00000000001;

      catscope.gasheatcapacity_A=193.8191579;
      catscope.gasheatcapacity_B=-1.5255853;
      catscope.gasheatcapacity_C=0.008501;
      catscope.gasheatcapacity_D=-1.61*0.00001;
      catscope.gasheatcapacity_E=1.51*0.00000001;
      catscope.gasheatcapacity_F=-6.99*0.000000000001;
      catscope.gasheatcapacity_G=1.28*0.000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "Butyl acrylate"){
      catscope.viscosity_A=-6.9308;
      catscope.viscosity_B=1.1689*1000;
      catscope.viscosity_C=0.0135;
      catscope.viscosity_D=-1.2339*0.00001;

      catscope.thermalconductivity_A=0.1747;
      catscope.thermalconductivity_B=-7.5186*0.00001;
      catscope.thermalconductivity_C=-2.5367*0.0000001;

      catscope.density_A=0.2995;
      catscope.density_B=0.2584;
      catscope.density_C=598;
      catscope.density_N=0.3084;

      catscope.heatcapacity_A=144279;
      catscope.heatcapacity_B=773.97;
      catscope.heatcapacity_C=-2.1258;
      catscope.heatcapacity_D=2.9021*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=128.17;

      catscope.crtitcal_temperature=598;
      catscope.crtitcal_pressure=26.3;

      catscope.gasviscosity_A=-5.21427;
      catscope.gasviscosity_B=0.237888;
      catscope.gasviscosity_C=-2.64*0.00001;
      catscope.gasviscosity_D=-3.79*0.000000001;

      catscope.gasthermalconductivity_A=-0.00443245;
      catscope.gasthermalconductivity_B=3.41*0.00001;
      catscope.gasthermalconductivity_C=7.6*0.00000001;
      catscope.gasthermalconductivity_D=-2.81*0.00000000001;

      catscope.gasheatcapacity_A=49.9043569;
      catscope.gasheatcapacity_B=0.47762932;
      catscope.gasheatcapacity_C=2.03*0.00001;
      catscope.gasheatcapacity_D=-3.38*0.0000001;
      catscope.gasheatcapacity_E=1.46*0.0000000001;
      catscope.gasheatcapacity_F=3.82*0.00000000000001;
      catscope.gasheatcapacity_G=-2.46*0.00000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "2,4-Dinitrotoluene"){
      catscope.viscosity_A=-7.17407;
      catscope.viscosity_B=	1695.91;
      catscope.viscosity_C=0.0100575;
      catscope.viscosity_D=-6.44734*0.000001;

      catscope.thermalconductivity_A=0.1451;
      catscope.thermalconductivity_B=-2.218*0.00001;
      catscope.thermalconductivity_C=-1.4283*0.0000001;

      catscope.density_A=0.374;
      catscope.density_B=0.2263;
      catscope.density_C=814;
      catscope.density_N=0.2915;

      catscope.heatcapacity_A=84530;
      catscope.heatcapacity_B=1218.6;
      catscope.heatcapacity_C=-2.4576;
      catscope.heatcapacity_D=2.1179*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=182.134;

      catscope.crtitcal_temperature=814;
      catscope.crtitcal_pressure=34;

      catscope.gasviscosity_A=2.97144;
      catscope.gasviscosity_B=0.179248;
      catscope.gasviscosity_C=3.81*0.00001;
      catscope.gasviscosity_D=-2.3*0.00000001;

      catscope.gasthermalconductivity_A=-0.000654074;
      catscope.gasthermalconductivity_B=9.27*0.000001;
      catscope.gasthermalconductivity_C=4.3*0.00000001;
      catscope.gasthermalconductivity_D=-1.52*0.00000000001;

      catscope.gasheatcapacity_A=75.81255323;
      catscope.gasheatcapacity_B=0.23628122;
      catscope.gasheatcapacity_C=0.000711;
      catscope.gasheatcapacity_D=-1,72*0.000001;
      catscope.gasheatcapacity_E=1.68*0.000000001;
      catscope.gasheatcapacity_F=-8.04*0.0000000000001;
      catscope.gasheatcapacity_G=1.54*0.0000000000000001;


    }else if(catscope.inorganic_acid_type_array[i]== "2,4-Diaminotoluene"){
      catscope.viscosity_A=-32.606;
      catscope.viscosity_B=6.0305*1000;
      catscope.viscosity_C=0.0565;
      catscope.viscosity_D=-3.3463*0.00001;

      catscope.thermalconductivity_A=0.1671;
      catscope.thermalconductivity_B=-2.6311*0.00001;
      catscope.thermalconductivity_C=-1.6763*0.0000001;

      catscope.density_A=0.3245;
      catscope.density_B=0.2467;
      catscope.density_C=804;
      catscope.density_N=0.2857;

      catscope.heatcapacity_A=105141;
      catscope.heatcapacity_B=990.94;
      catscope.heatcapacity_C=-1.9691;
      catscope.heatcapacity_D=1.732*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=122.17;

      catscope.crtitcal_temperature=804;
      catscope.crtitcal_pressure=43.8;

      catscope.gasviscosity_A=2.58603;
      catscope.gasviscosity_B=0.177128;
      catscope.gasviscosity_C=3.52214*0.00001;
      catscope.gasviscosity_D=-2.19445*0.00000001;

      catscope.gasthermalconductivity_A=-0.00433594;
      catscope.gasthermalconductivity_B=2.6517*0.00001;
      catscope.gasthermalconductivity_C=6.22903*0.00000001;
      catscope.gasthermalconductivity_D=-2.16891*0.00000000001;

      catscope.gasheatcapacity_A=-7.544*10;
      catscope.gasheatcapacity_B=1.0663;
      catscope.gasheatcapacity_C=-1.1548*0.001;
      catscope.gasheatcapacity_D=6.104*0.0000001;
      catscope.gasheatcapacity_E=-1.1054*0.0000000001;
      catscope.gasheatcapacity_F=0;
      catscope.gasheatcapacity_G=0;


    }else if(catscope.inorganic_acid_type_array[i]== "vinyl chloride"){
      catscope.viscosity_A=-1.1063;
      catscope.viscosity_B=2.1454*100;
      catscope.viscosity_C=-0.0009;
      catscope.viscosity_D=-1.3519*0.000001;

      catscope.thermalconductivity_A=0.2242;
      catscope.thermalconductivity_B=-2.0547*0.0001;
      catscope.thermalconductivity_C=-4.5028*0.0000001;

      catscope.density_A=0.349;
      catscope.density_B=0.2707;
      catscope.density_C=432;
      catscope.density_N=0.2716;

      catscope.heatcapacity_A=48806;
      catscope.heatcapacity_B=287.92;
      catscope.heatcapacity_C=-1.1535;
      catscope.heatcapacity_D=2.1636*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=62.498;

      catscope.crtitcal_temperature=432;
      catscope.crtitcal_pressure=56.7;

      catscope.gasviscosity_A=-11.311;
      catscope.gasviscosity_B=0.3996;
      catscope.gasviscosity_C=-8.841*0.00001;
      catscope.gasviscosity_D=0;

      catscope.gasthermalconductivity_A=-9.17*0.001;
      catscope.gasthermalconductivity_B=6.56*0.00001;
      catscope.gasthermalconductivity_C=9.81*0.000000001;
      catscope.gasthermalconductivity_D=0;

      catscope.gasheatcapacity_A=17.2;
      catscope.gasheatcapacity_B=1.46*0.1;
      catscope.gasheatcapacity_C=-6.43*0.00001;
      catscope.gasheatcapacity_D=-3.24*0.000000001;
      catscope.gasheatcapacity_E=6.79*0.000000000001;
      catscope.gasheatcapacity_F=0;
      catscope.gasheatcapacity_G=0;


    }else if(catscope.inorganic_acid_type_array[i]== "TDI"){
      catscope.viscosity_A=-8.86951;
      catscope.viscosity_B=1565.47;
      catscope.viscosity_C=0.0180436;
      catscope.viscosity_D=-1.44964*0.00001;

      catscope.thermalconductivity_A=0.148;
      catscope.thermalconductivity_B=-3.8379*0.00001;
      catscope.thermalconductivity_C=-1.5993*0.0000001;

      catscope.density_A=0.3317;
      catscope.density_B=0.2458;
      catscope.density_C=737;
      catscope.density_N=0.1439;

      catscope.heatcapacity_A=160304;
      catscope.heatcapacity_B=843.04;
      catscope.heatcapacity_C=-1.9148;
      catscope.heatcapacity_D=1.7489*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=174.159;

      catscope.crtitcal_temperature=737;
      catscope.crtitcal_pressure=30.4;

      catscope.gasviscosity_A=0.294021;
      catscope.gasviscosity_B=0.188692;
      catscope.gasviscosity_C=1.92*0.00001;
      catscope.gasviscosity_D=-1.73*0.00000001;

      catscope.gasthermalconductivity_A=-0.00323092;
      catscope.gasthermalconductivity_B=1.83*0.00001;
      catscope.gasthermalconductivity_C=5.84*0.00000001;
      catscope.gasthermalconductivity_D=-2.81*0.00000000001;

      catscope.gasheatcapacity_A=190.9572171;
      catscope.gasheatcapacity_B=-1.270986;
      catscope.gasheatcapacity_C=0.007048;
      catscope.gasheatcapacity_D=-1.32*0.00001;
      catscope.gasheatcapacity_E=1.23*0.00000001;
      catscope.gasheatcapacity_F=-5.7*0.000000000001;
      catscope.gasheatcapacity_G=1.04*0.000000000000001;



    }else if(catscope.inorganic_acid_type_array[i]== "MDI"){
      catscope.viscosity_A=-5.26314;
      catscope.viscosity_B=1296.24;
      catscope.viscosity_C=0.00663979;
      catscope.viscosity_D=-4.45188*0.000001;

      catscope.thermalconductivity_A=0.1321;
      catscope.thermalconductivity_B=-1.8295*0.00001;
      catscope.thermalconductivity_C=-1.37*0.0000001;

      catscope.density_A=0.3515;
      catscope.density_B=0.2434;
      catscope.density_C=802;
      catscope.density_N=0.2857;

      catscope.heatcapacity_A=120755;
      catscope.heatcapacity_B=1836.6;
      catscope.heatcapacity_C=-3.8273;
      catscope.heatcapacity_D=3.2865*0.001;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=250.25;

      catscope.crtitcal_temperature=802;
      catscope.crtitcal_pressure=22.8;

      catscope.gasviscosity_A=2.35999;
      catscope.gasviscosity_B=0.166142;
      catscope.gasviscosity_C=3.26*0.00001;
      catscope.gasviscosity_D=-2.04*0.00000001;

      catscope.gasthermalconductivity_A=-0.00100249;
      catscope.gasthermalconductivity_B=6.63*0.000001;
      catscope.gasthermalconductivity_C=3.72*0.00000001;
      catscope.gasthermalconductivity_D=-1.36*0.00000000001;

      catscope.gasheatcapacity_A=225.8204756;
      catscope.gasheatcapacity_B=-1.238206;
      catscope.gasheatcapacity_C=0.007511;
      catscope.gasheatcapacity_D=-1.41*0.00001;
      catscope.gasheatcapacity_E=1.31*0.00000001;
      catscope.gasheatcapacity_F=-6.06*0.000000000001;
      catscope.gasheatcapacity_G=1.12*0.000000000000001;


    }else{
      catscope.viscosity_A=0;
      catscope.viscosity_B=0;
      catscope.viscosity_C=0;
      catscope.viscosity_D=0;

      catscope.thermalconductivity_A=0;
      catscope.thermalconductivity_B=0;
      catscope.thermalconductivity_C=0;

      catscope.density_A=1;
      catscope.density_B=1;
      catscope.density_C=300;
      catscope.density_N=1;

      catscope.heatcapacity_A=0;
      catscope.heatcapacity_B=0;
      catscope.heatcapacity_C=0;
      catscope.heatcapacity_D=0;
      catscope.heatcapacity_E=0;

      catscope.molecular_weight=1;

      catscope.crtitcal_temperature=0;
      catscope.crtitcal_pressure=0;

      catscope.gasviscosity_A=0;
      catscope.gasviscosity_B=0;
      catscope.gasviscosity_C=0;
      catscope.gasviscosity_D=0;

      catscope.gasthermalconductivity_A=0;
      catscope.gasthermalconductivity_B=0;
      catscope.gasthermalconductivity_C=0;
      catscope.gasthermalconductivity_D=0;

      catscope.gasheatcapacity_A=0;
      catscope.gasheatcapacity_B=0;
      catscope.gasheatcapacity_C=0;
      catscope.gasheatcapacity_D=0;
      catscope.gasheatcapacity_E=0;
      catscope.gasheatcapacity_F=0;
      catscope.gasheatcapacity_G=0;


    }
    inorganic_acidhc_calc[i]=math.eval('heatcapacity_A+heatcapacity_B*temp+heatcapacity_C*(temp^2)+heatcapacity_D*(temp^3)+heatcapacity_E*(temp^4)',catscope);
    inorganic_acidhc_mw[i]=math.eval('molecular_weight/1',catscope);

    catscope.inorganic_acidhc_calc_i=inorganic_acidhc_calc[i];
    catscope.inorganic_acidhc_mw_i=inorganic_acidhc_mw[i];

    inorganic_acidgashc_calc[i]=math.eval('gasheatcapacity_A+gasheatcapacity_B*temp+gasheatcapacity_C*(temp^2)+gasheatcapacity_D*(temp^3)+gasheatcapacity_E*(temp^4)+gasheatcapacity_F*(temp^5)+gasheatcapacity_G*(temp^6)',catscope);
    inorganic_acidgashc_mw[i]=math.eval('molecular_weight',catscope);

    catscope.inorganic_acidgashc_calc_i=inorganic_acidgashc_calc[i];
    catscope.inorganic_acidgashc_mw_i=inorganic_acidgashc_mw[i];

    inorganic_acidv[i]=math.eval('(10^(viscosity_A+viscosity_B/temp+viscosity_C*temp+viscosity_D*(temp^2)))/1000',catscope);
    inorganic_acidtc[i]=math.eval('thermalconductivity_A+thermalconductivity_B*temp+thermalconductivity_C*(temp^2)',catscope);
    inorganic_acidd[i]=math.eval('1000*(density_A*density_B^(-(1-temp/density_C)^density_N))',catscope);
    inorganic_acidhc[i]=math.eval('inorganic_acidhc_calc_i/inorganic_acidhc_mw_i',catscope);
    inorganic_acidct[i]=math.eval('crtitcal_temperature',catscope);
    inorganic_acidcp[i]=math.eval('crtitcal_pressure',catscope);
    inorganic_acidgasv[i]=math.eval('(gasviscosity_A+gasviscosity_B*temp+gasviscosity_C*(temp^2)+gasviscosity_D*temp^3)/10000000',catscope);
    inorganic_acidgastc[i]=math.eval('gasthermalconductivity_A+gasthermalconductivity_B*temp+gasthermalconductivity_C*(temp^2)+gasthermalconductivity_D*(temp)^3',catscope);
    inorganic_acidgasd[i]=math.eval('pressure*molecular_weight*100000/(temp*8.314)',catscope);
    inorganic_acidgashc[i]=math.eval('inorganic_acidgashc_calc_i*1000/inorganic_acidgashc_mw_i',catscope);



    }
    return [inorganic_acidv,inorganic_acidtc,inorganic_acidd,inorganic_acidhc, inorganic_acidct, inorganic_acidcp, inorganic_acidgasv, inorganic_acidgastc, inorganic_acidgasd, inorganic_acidgashc];
}

//inorganic liquid heat capacity



///common used gas properties

function common_used_gas_fun(catscope){
    var common_used_gasv=[];
    var common_used_gastc=[];
    var common_used_gasd=[];
    var common_used_gashc=[];
    var common_used_gashc_calc=[];
    var common_used_gashc_mw=[];
    var common_used_gasct=[];
    var common_used_gascp=[];
    var common_used_gasliquidv=[];
    var common_used_gasliquidtc=[];
    var common_used_gasliquidd=[];
    var common_used_gasliquidhc=[];
    var common_used_gasliquidhc_calc=[];
    var common_used_gasliquidhc_mw=[];


    for(i=0;i<5;i++){

      catscope.joback_Tr_i=catscope.joback_Tr_array[i];

        if(catscope.common_used_gas_type_array[i] == "CH4"){
      catscope.viscosity_A=3.844;
      catscope.viscosity_B=0.40112;
      catscope.viscosity_C=-1.4303*0.0001;
      catscope.viscosity_D=0;

      catscope.thermalconductivity_A=-0.00935;
      catscope.thermalconductivity_B= 1.4028*0.0001;
      catscope.thermalconductivity_C=3.3180*0.00000001;
      catscope.thermalconductivity_D=0;

      catscope.heatcapacity_A=34.942;
      catscope.heatcapacity_B=-3.9957*0.01;
      catscope.heatcapacity_C=1.9184*0.0001;
      catscope.heatcapacity_D=-1.5303*0.0000001;
      catscope.heatcapacity_E=3.9321*0.00000000001;
      catscope.heatcapacity_F=0;
      catscope.heatcapacity_G=0;

      catscope.molecular_weight=16.04;

      catscope.crtitcal_temperature=190.58;
      catscope.crtitcal_pressure=46.04;

      catscope.liquidviscosity_A=-7.3801;
      catscope.liquidviscosity_B=319.25;
      catscope.liquidviscosity_C=0.047934;
      catscope.liquidviscosity_D=-0.0001412;

      catscope.liquidthermalconductivity_A=0.37;
      catscope.liquidthermalconductivity_B=-0.00158;
      catscope.liquidthermalconductivity_C=0;

      catscope.liquiddensity_A=0.16;
      catscope.liquiddensity_B=0.2881;
      catscope.liquiddensity_C=190.58;
      catscope.liquiddensity_N=0.277;

      catscope.liquidheatcapacity_A=-0.018*1000;
      catscope.liquidheatcapacity_B=1.2*1000;
      catscope.liquidheatcapacity_C=-9.87*0.001*1000;
      catscope.liquidheatcapacity_D=3.17*0.00001*1000;
      catscope.liquidheatcapacity_E=0;

    } else if(catscope.common_used_gas_type_array[i] == "H2O"){
      catscope.viscosity_A=-36.826;
      catscope.viscosity_B=0.429;
      catscope.viscosity_C=-1.62*0.00001;
      catscope.viscosity_D=0;

      catscope.thermalconductivity_A=0.00053;
      catscope.thermalconductivity_B=4.7093*0.00001;
      catscope.thermalconductivity_C= 4.9551*0.00000001;
      catscope.thermalconductivity_D=0;

      catscope.heatcapacity_A=33.933;
      catscope.heatcapacity_B=-8.4186*0.001;
      catscope.heatcapacity_C=2.9906*0.00001;
      catscope.heatcapacity_D=-1.7825*0.00000001;
      catscope.heatcapacity_E=3.6934*0.000000000001;
      catscope.heatcapacity_F=0;
      catscope.heatcapacity_G=0;

      catscope.molecular_weight=18.08;

      catscope.crtitcal_temperature=647.13;
      catscope.crtitcal_pressure=220.55;

      catscope.liquidviscosity_A=-11.6225;
      catscope.liquidviscosity_B=1948.96;
      catscope.liquidviscosity_C=0.021641;
      catscope.liquidviscosity_D=-0.00001559;

      catscope.liquidthermalconductivity_A=-0.2987;
      catscope.liquidthermalconductivity_B=0.0047054;
      catscope.liquidthermalconductivity_C=-0.0000056209;

      catscope.liquiddensity_A=0.325;
      catscope.liquiddensity_B=0.27;
      catscope.liquiddensity_C=647.13;
      catscope.liquiddensity_N=0.23;

      catscope.liquidheatcapacity_A=276370;
      catscope.liquidheatcapacity_B=-2090.1;
      catscope.liquidheatcapacity_C=8.125;
      catscope.liquidheatcapacity_D=-0.014116;
      catscope.liquidheatcapacity_E=0.0000093701;

    }else if(catscope.common_used_gas_type_array[i] == "H2"){
      catscope.viscosity_A=27.758;
      catscope.viscosity_B=0.212;
      catscope.viscosity_C=-3.28*0.00001;
      catscope.viscosity_D=0;

      catscope.thermalconductivity_A=0.03951;
      catscope.thermalconductivity_B=4.5918*0.0001;
      catscope.thermalconductivity_C=-6.4933*0.00000001;
      catscope.thermalconductivity_D=0;

      catscope.heatcapacity_A=25.399;
      catscope.heatcapacity_B=2.0178*0.01;
      catscope.heatcapacity_C=-3.8549*0.00001;
      catscope.heatcapacity_D=3.188*0.00000001;
      catscope.heatcapacity_E=-8.7585*0.000000000001;
      catscope.heatcapacity_F=0;
      catscope.heatcapacity_G=0;

      catscope.molecular_weight=2;

      catscope.crtitcal_temperature=33.18;
      catscope.crtitcal_pressure=13.13;

      catscope.liquidviscosity_A=-2.92889;
      catscope.liquidviscosity_B=14.7781;
      catscope.liquidviscosity_C=0.0288334;
      catscope.liquidviscosity_D=-0.000635574;

      catscope.liquidthermalconductivity_A=-0.0485;
      catscope.liquidthermalconductivity_B=0.0130167;
      catscope.liquidthermalconductivity_C=-0.000283333;

      catscope.liquiddensity_A=0.03125;
      catscope.liquiddensity_B=0.3473;
      catscope.liquiddensity_C=33.18;
      catscope.liquiddensity_N=0.2756;

      catscope.liquidheatcapacity_A=50.607*1000;
      catscope.liquidheatcapacity_B=-6.11*1000;
      catscope.liquidheatcapacity_C=3.09*0.1*1000;
      catscope.liquidheatcapacity_D=-4.15*0.001*1000;
      catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i]== "O2"){
      catscope.viscosity_A=44.224;
      catscope.viscosity_B=0.562;
      catscope.viscosity_C=-1.13*0.0001;
      catscope.viscosity_D=0;

      catscope.thermalconductivity_A= 0.00121;
      catscope.thermalconductivity_B=8.6157*0.00001;
      catscope.thermalconductivity_C=-1.3346*0.00000001;
      catscope.thermalconductivity_D=0;

      catscope.heatcapacity_A=29.526;
      catscope.heatcapacity_B=-8.8999*0.001;
      catscope.heatcapacity_C=3.8083*0.00001;
      catscope.heatcapacity_D=-3.2629*0.00000001;
      catscope.heatcapacity_E=8.8607*0.000000000001;
      catscope.heatcapacity_F=0;
      catscope.heatcapacity_G=0;

      catscope.molecular_weight=32;

      catscope.crtitcal_temperature=154.58;
      catscope.crtitcal_pressure=50.43;

      catscope.liquidviscosity_A=-2.13535;
      catscope.liquidviscosity_B=86.8236;
      catscope.liquidviscosity_C=0.0105406;
      catscope.liquidviscosity_D=-6.07*0.00001;

      catscope.liquidthermalconductivity_A=0.227603;
      catscope.liquidthermalconductivity_B=-0.00043647;
      catscope.liquidthermalconductivity_C=-4.49*0.000001;

      catscope.liquiddensity_A=0.43533;
      catscope.liquiddensity_B=0.2877;
      catscope.liquiddensity_C=154.58;
      catscope.liquiddensity_N=0.2924;

      catscope.liquidheatcapacity_A=46.432*1000;
      catscope.liquidheatcapacity_B=3.95*0.1*1000;
      catscope.liquidheatcapacity_C=-7.05*0.001*1000;
      catscope.liquidheatcapacity_D=3.99*0.00001*1000;
      catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i] == "N2"){
      catscope.viscosity_A=42.606;
      catscope.viscosity_B=0.475;
      catscope.viscosity_C=-9.88*0.00001;
      catscope.viscosity_D=0;

      catscope.thermalconductivity_A=0.00309;
      catscope.thermalconductivity_B=7.5930*0.00001;
      catscope.thermalconductivity_C=-1.1014*0.00000001;
      catscope.thermalconductivity_D=0;

      catscope.heatcapacity_A=29.342;
      catscope.heatcapacity_B=-3.5395*0.001;
      catscope.heatcapacity_C=1.0076*0.00001;
      catscope.heatcapacity_D=-4.3116*0.000000001;
      catscope.heatcapacity_E=2.5935*0.0000000000001;
      catscope.heatcapacity_F=0;
      catscope.heatcapacity_G=0;

      catscope.molecular_weight=28.0134;

      catscope.crtitcal_temperature=126.2;
      catscope.crtitcal_pressure=34.6;

      catscope.liquidviscosity_A=-8.87392;
      catscope.liquidviscosity_B=274.679;
      catscope.liquidviscosity_C=0.0855023;
      catscope.liquidviscosity_D=-0.000348359;

      catscope.liquidthermalconductivity_A=0.286355;
      catscope.liquidthermalconductivity_B=-0.00201053;
      catscope.liquidthermalconductivity_C=1.09*0.000001;

      catscope.liquiddensity_A=0.31205;
      catscope.liquiddensity_B=0.2848;
      catscope.liquiddensity_C=126.1;
      catscope.liquiddensity_N=0.2925;

      catscope.liquidheatcapacity_A=76.452*1000;
      catscope.liquidheatcapacity_B=-3.52*0.1*1000;
      catscope.liquidheatcapacity_C=-2.67*0.001*1000;
      catscope.liquidheatcapacity_D=5.01*0.00001*1000;
      catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i] == "NH3"){
      catscope.viscosity_A=-7.874;
      catscope.viscosity_B=0.367;
      catscope.viscosity_C=-4.47*0.000001;
      catscope.viscosity_D=0;

      catscope.thermalconductivity_A= 0.00457;
      catscope.thermalconductivity_B= 2.3239*0.00001;
      catscope.thermalconductivity_C= 1.481*0.0000001;
      catscope.thermalconductivity_D=0;

      catscope.heatcapacity_A=33.573;
      catscope.heatcapacity_B=-1.2581*0.01;
      catscope.heatcapacity_C=8.8906*0.00001;
      catscope.heatcapacity_D=-7.1783*0.00000001;
      catscope.heatcapacity_E=1.8569*0.00000000001;
      catscope.heatcapacity_F=0;
      catscope.heatcapacity_G=0;

      catscope.molecular_weight=17.031;

      catscope.crtitcal_temperature=405.65;
      catscope.crtitcal_pressure=112.8;

      catscope.liquidviscosity_A=1.2055;
      catscope.liquidviscosity_B=-74.539;
      catscope.liquidviscosity_C=-0.0062862;
      catscope.liquidviscosity_D=0.00000086771;

      catscope.liquidthermalconductivity_A=1.169;
      catscope.liquidthermalconductivity_B=-0.002314;
      catscope.liquidthermalconductivity_C=0;

      catscope.liquiddensity_A=0.23684;
      catscope.liquiddensity_B=0.25443;
      catscope.liquiddensity_C=405.65;
      catscope.liquiddensity_N=0.2888;

      catscope.liquidheatcapacity_A=-27826.08*17;
      catscope.liquidheatcapacity_B=348.38999*17;
      catscope.liquidheatcapacity_C=-1.261995*17;
      catscope.liquidheatcapacity_D=1.543222*0.001*17;
      catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i] == "CO"){
      catscope.viscosity_A=23.811;
      catscope.viscosity_B=0.53944;
      catscope.viscosity_C=-1.5411*0.0001;
      catscope.viscosity_D=0;

      catscope.thermalconductivity_A= 0.00158;
      catscope.thermalconductivity_B= 8.2511*0.00001;
      catscope.thermalconductivity_C=-1.9081*0.00000001;
      catscope.thermalconductivity_D=0;

      catscope.heatcapacity_A=29.556;
      catscope.heatcapacity_B=-6.5807*0.001;
      catscope.heatcapacity_C=2.013*0.00001;
      catscope.heatcapacity_D=-1.2227*0.00000001;
      catscope.heatcapacity_E=2.2617*0.000000000001;
      catscope.heatcapacity_F=0;
      catscope.heatcapacity_G=0;

      catscope.molecular_weight=28.01;

      catscope.crtitcal_temperature=132.92;
      catscope.crtitcal_pressure=34.99;

      catscope.liquidviscosity_A=-1.1224;
      catscope.liquidviscosity_B=57.858;
      catscope.liquidviscosity_C=-0.0049174;
      catscope.liquidviscosity_D=8.22*0.000001;

      catscope.liquidthermalconductivity_A=0.2855;
      catscope.liquidthermalconductivity_B=-0.001784;
      catscope.liquidthermalconductivity_C=0;

      catscope.liquiddensity_A=0.2982;
      catscope.liquiddensity_B=0.2766;
      catscope.liquiddensity_C=132.92;
      catscope.liquiddensity_N=0.2905;

      catscope.liquidheatcapacity_A=-19312;
      catscope.liquidheatcapacity_B=2510;
      catscope.liquidheatcapacity_C=-2.9*0.01*1000;
      catscope.liquidheatcapacity_D=1.27*0.0001*1000;
      catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i]== "CO2"){
      catscope.viscosity_A= 11.811;
      catscope.viscosity_B= 0.49838;
      catscope.viscosity_C=-1.0851*0.0001;
      catscope.viscosity_D=0;

      catscope.thermalconductivity_A=-0.01200;
      catscope.thermalconductivity_B=1.0208*0.0001;
      catscope.thermalconductivity_C=-2.2403*0.00000001;
      catscope.thermalconductivity_D=0;

      catscope.heatcapacity_A=27.437;
      catscope.heatcapacity_B=4.2315*0.01;
      catscope.heatcapacity_C=-1.9555*0.00001;
      catscope.heatcapacity_D=3.9968*0.000000001;
      catscope.heatcapacity_E=-2.9872*0.0000000000001;
      catscope.heatcapacity_F=0;
      catscope.heatcapacity_G=0;

      catscope.molecular_weight=44.01;

      catscope.crtitcal_temperature=304.19;
      catscope.crtitcal_pressure=73.82;

      catscope.liquidviscosity_A=-19.4921;
      catscope.liquidviscosity_B=1594.8;
      catscope.liquidviscosity_C=0.079274;
      catscope.liquidviscosity_D=-0.00012025;

      catscope.liquidthermalconductivity_A=0.43199;
      catscope.liquidthermalconductivity_B=-0.0011929;
      catscope.liquidthermalconductivity_C=0;

      catscope.liquiddensity_A=0.4638;
      catscope.liquiddensity_B=0.2616;
      catscope.liquiddensity_C=304.19;
      catscope.liquiddensity_N=0.2903;

      catscope.liquidheatcapacity_A=-338.956*1000;
      catscope.liquidheatcapacity_B=5.28*1000;
      catscope.liquidheatcapacity_C=-2.33*0.01*1000;
      catscope.liquidheatcapacity_D=3.6*0.00001*1000;
      catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i]== "SO2"){
      catscope.viscosity_A=-11.103;
      catscope.viscosity_B=0.502;
      catscope.viscosity_C=-1.08*0.0001;
      catscope.viscosity_D=0;

      catscope.thermalconductivity_A=-0.00394;
      catscope.thermalconductivity_B=4.4847*0.00001;
      catscope.thermalconductivity_C=2.1066*0.000000001;
      catscope.thermalconductivity_D=0;

      catscope.heatcapacity_A=29.637;
      catscope.heatcapacity_B=3.4735*0.01;
      catscope.heatcapacity_C=9.2903*0.000001;
      catscope.heatcapacity_D=-2.9885*0.00000001;
      catscope.heatcapacity_E=1.0937*0.00000000001;
      catscope.heatcapacity_F=0;
      catscope.heatcapacity_G=0;

      catscope.molecular_weight=64.066;

      catscope.crtitcal_temperature=430.75;
      catscope.crtitcal_pressure=78.84;

      catscope.liquidviscosity_A=-3.04495;
      catscope.liquidviscosity_B=436.809;
      catscope.liquidviscosity_C=0.00767249;
      catscope.liquidviscosity_D=-1.46*0.00001;

      catscope.liquidthermalconductivity_A=0.38218;
      catscope.liquidthermalconductivity_B=-0.0006254;
      catscope.liquidthermalconductivity_C=0;

      catscope.liquiddensity_A=0.5221;
      catscope.liquiddensity_B=0.2584;
      catscope.liquiddensity_C=430.75;
      catscope.liquiddensity_N=0.2895;

      catscope.liquidheatcapacity_A=203.445*1000;
      catscope.liquidheatcapacity_B=-1.05*1000;
      catscope.liquidheatcapacity_C=2.61;
      catscope.liquidheatcapacity_D=-1.07*0.000001*1000;
      catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i]== "Cl2"){
        catscope.viscosity_A=-3.571;
        catscope.viscosity_B=0.487;
        catscope.viscosity_C=-8.53*0.00001;
        catscope.viscosity_D=0;

        catscope.thermalconductivity_A=-0.00194;
        catscope.thermalconductivity_B=3.83*0.00001;
        catscope.thermalconductivity_C=-6.3523*0.000000001;
        catscope.thermalconductivity_D=0;

        catscope.heatcapacity_A=27.213;
        catscope.heatcapacity_B=3.0426*0.01;
        catscope.heatcapacity_C=-3.3353*0.00001;
        catscope.heatcapacity_D=1.5961*0.00000001;
        catscope.heatcapacity_E=-2.7021*0.000000000001;
        catscope.heatcapacity_F=0;
        catscope.heatcapacity_G=0;

        catscope.molecular_weight=70.906;

        catscope.crtitcal_temperature=417.15;
        catscope.crtitcal_pressure=77.11;

        catscope.liquidviscosity_A=-1.13761;
        catscope.liquidviscosity_B=198.527;
        catscope.liquidviscosity_C=0;
        catscope.liquidviscosity_D=0;

        catscope.liquidthermalconductivity_A=0.204466;
        catscope.liquidthermalconductivity_B=5.86*0.00001;
        catscope.liquidthermalconductivity_C=-9.71*0.0000001;

        catscope.liquiddensity_A=0.3771;
        catscope.liquiddensity_B=0.2297;
        catscope.liquiddensity_C=449;
        catscope.liquiddensity_N=0.2386;

        catscope.liquidheatcapacity_A=22894;
        catscope.liquidheatcapacity_B=6.59*100;
        catscope.liquidheatcapacity_C=-2.27;
        catscope.liquidheatcapacity_D=3.32*0.000001*1000;
        catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i]== "H2O2"){
        catscope.viscosity_A=8.039;
        catscope.viscosity_B=2.7*0.1;
        catscope.viscosity_C=8.29*0.00001;
        catscope.viscosity_D=0;

        catscope.thermalconductivity_A=-0.00858;
        catscope.thermalconductivity_B=8.6933*0.00001;
        catscope.thermalconductivity_C=-6.2970*0.000000001;
        catscope.thermalconductivity_D=0;

        catscope.heatcapacity_A= 36.181;
        catscope.heatcapacity_B=8.2657*0.001;
        catscope.heatcapacity_C= 6.6420*0.00001;
        catscope.heatcapacity_D= -6.9944*0.00000001;
        catscope.heatcapacity_E=2.0951*0.00000000001;
        catscope.heatcapacity_F=0;
        catscope.heatcapacity_G=0;

        catscope.molecular_weight=34;

        catscope.crtitcal_temperature=730.15;
        catscope.crtitcal_pressure=217;

        catscope.liquidviscosity_A=2.97632;
        catscope.liquidviscosity_B=-6.68707;
        catscope.liquidviscosity_C=-0.0113425;
        catscope.liquidviscosity_D=5.45*0.000001;

        catscope.liquidthermalconductivity_A=-0.1697;
        catscope.liquidthermalconductivity_B=0.0032525;
        catscope.liquidthermalconductivity_C=-3.51*0.000001;

        catscope.liquiddensity_A=0.43776;
        catscope.liquiddensity_B=0.2498;
        catscope.liquiddensity_C=730.15;
        catscope.liquiddensity_N=0.2877;

        catscope.liquidheatcapacity_A=-15248;
        catscope.liquidheatcapacity_B=6.77*100;
        catscope.liquidheatcapacity_C=-1.49;
        catscope.liquidheatcapacity_D=1.2*0.000001*1000;
        catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i]== "HNO3"){
        catscope.viscosity_A=-11.5389;
        catscope.viscosity_B=0.377158;
        catscope.viscosity_C=-9.73016*0.00001;
        catscope.viscosity_D=1.96683*0.00000001;

        catscope.thermalconductivity_A=-0.00376064;
        catscope.thermalconductivity_B=4.7737*0.00001;
        catscope.thermalconductivity_C=2.18879*0.00000001;
        catscope.thermalconductivity_D=-9.97479*0.000000000001;

        catscope.heatcapacity_A=29.13605;
        catscope.heatcapacity_B=0.00904285;
        catscope.heatcapacity_C= 0.000488715;
        catscope.heatcapacity_D= -1.11262*0.000001;
        catscope.heatcapacity_E=1.10271*0.000000001;
        catscope.heatcapacity_F=-5.23348*0.0000000000001;
        catscope.heatcapacity_G=9.67869*0.00000000000000001;

        catscope.molecular_weight=63;

        catscope.crtitcal_temperature=520;
        catscope.crtitcal_pressure=68.9;

        catscope.liquidviscosity_A=-3.426;
        catscope.liquidviscosity_B=719.6;
        catscope.liquidviscosity_C=0.0036519;
        catscope.liquidviscosity_D=-0.0000019024;

        catscope.liquidthermalconductivity_A=0.1211;
        catscope.liquidthermalconductivity_B=0.0005383;
        catscope.liquidthermalconductivity_C=0;

        catscope.liquiddensity_A=1.37243;
        catscope.liquiddensity_B=0.83561;
        catscope.liquiddensity_C=520;
        catscope.liquiddensity_N=0.19330;

        catscope.liquidheatcapacity_A=3402.7168*63;
        catscope.liquidheatcapacity_B=-12.181954*63;
        catscope.liquidheatcapacity_C=2.375704*0.01*63;
        catscope.liquidheatcapacity_D=-4.79394*0.000001*63;
        catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i]== "H2SO4"){
        catscope.viscosity_A=3.76564;
        catscope.viscosity_B=0.178867;
        catscope.viscosity_C=6.00392*0.000001;
        catscope.viscosity_D=-1.37848*0.000000001;

        catscope.thermalconductivity_A=-0.00353158;
        catscope.thermalconductivity_B=3.0385*0.00001;
        catscope.thermalconductivity_C=9.07031*0.000000001;
        catscope.thermalconductivity_D=-3.36734*0.000000000001;

        catscope.heatcapacity_A= 12.03605987;
        catscope.heatcapacity_B=0.335062512;
        catscope.heatcapacity_C= -0.000355562;
        catscope.heatcapacity_D= 1.0221*0.0000001;
        catscope.heatcapacity_E=1.21511*0.0000000001;
        catscope.heatcapacity_F=-1.07609*0.0000000000001;
        catscope.heatcapacity_G=2.5041*0.00000000000000001;

        catscope.molecular_weight=98;

        catscope.crtitcal_temperature=924;
        catscope.crtitcal_pressure=64;

        catscope.liquidviscosity_A=-18.7214;
        catscope.liquidviscosity_B=3498.6;
        catscope.liquidviscosity_C=0.033166;
        catscope.liquidviscosity_D=-0.000017039;

        catscope.liquidthermalconductivity_A=0.0142;
        catscope.liquidthermalconductivity_B=0.0010763;
        catscope.liquidthermalconductivity_C=0;

        catscope.liquiddensity_A=1.4915;
        catscope.liquiddensity_B=0.79186;
        catscope.liquiddensity_C=924;
        catscope.liquiddensity_N=0.2713;

        catscope.liquidheatcapacity_A=265.1319*98;
        catscope.liquidheatcapacity_B=7.171428*98;
        catscope.liquidheatcapacity_C=-1.412731*0.01*98;
        catscope.liquidheatcapacity_D=1.054451*0.00001*98;
        catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i]== "HCl"){
        catscope.viscosity_A=-16.8499;
        catscope.viscosity_B=0.598746;
        catscope.viscosity_C=-0.000182906;
        catscope.viscosity_D=3.83399*0.00000001;

        catscope.thermalconductivity_A=-0.00274875;
        catscope.thermalconductivity_B=6.12872*0.00001;
        catscope.thermalconductivity_C=-7.97387*0.000000001;
        catscope.thermalconductivity_D=1.28211*0.000000000001;

        catscope.heatcapacity_A=27.91428448;
        catscope.heatcapacity_B=0.004097654;
        catscope.heatcapacity_C=0;
        catscope.heatcapacity_D=0;
        catscope.heatcapacity_E=0;
        catscope.heatcapacity_F=0;
        catscope.heatcapacity_G=0;

        catscope.molecular_weight=36.5;

        catscope.crtitcal_temperature=324.65;
        catscope.crtitcal_pressure=83.1;

        catscope.liquidviscosity_A=5.8809;
        catscope.liquidviscosity_B=-608.03;
        catscope.liquidviscosity_C=-0.020288;
        catscope.liquidviscosity_D=0.0000124;

        catscope.liquidthermalconductivity_A=0.4593;
        catscope.liquidthermalconductivity_B=-0.00016539;
        catscope.liquidthermalconductivity_C=-0.0000025781;

        catscope.liquiddensity_A=0.44651;
        catscope.liquiddensity_B=0.2729;
        catscope.liquiddensity_C=324.65;
        catscope.liquiddensity_N=0.3217;

        catscope.liquidheatcapacity_A=2029.39*36.5;
        catscope.liquidheatcapacity_B=-3.550678*36.5;
        catscope.liquidheatcapacity_C=-2.166171*0.001*36.5;
        catscope.liquidheatcapacity_D=7.243153*0.00001*36.5;
        catscope.liquidheatcapacity_E=0;

    }
    else if(catscope.common_used_gas_type_array[i]== "Monoethanolamine"){
        catscope.viscosity_A=-3.20144;
        catscope.viscosity_B=0.200941;
        catscope.viscosity_C=-9.99793*0.000001;
        catscope.viscosity_D=-7.688957*0.000000001;

        catscope.thermalconductivity_A=-0.00168879;
        catscope.thermalconductivity_B=1.38495*0.00001;
        catscope.thermalconductivity_C=5.6356*0.00000001;
        catscope.thermalconductivity_D=-1.96787*0.00000000001;

        catscope.heatcapacity_A=-5.55*0.1;
        catscope.heatcapacity_B=3.7003*0.1;
        catscope.heatcapacity_C=-3.1976*0.0001;
        catscope.heatcapacity_D=1.583*0.0000001;
        catscope.heatcapacity_E=-3.2344*0.00000000001;
        catscope.heatcapacity_F=0;
        catscope.heatcapacity_G=0;

        catscope.molecular_weight=61.084;

        catscope.crtitcal_temperature=638;
        catscope.crtitcal_pressure=68.7;

        catscope.liquidviscosity_A=-13.182;
        catscope.liquidviscosity_B=2.8596*1000;
        catscope.liquidviscosity_C=0.0208;
        catscope.liquidviscosity_D=-1.423*0.00001;

        catscope.liquidthermalconductivity_A=0.2985;
        catscope.liquidthermalconductivity_B=-6.6781*0.00001;
        catscope.liquidthermalconductivity_C=-3.5331*0.0000001;

        catscope.liquiddensity_A=0.2715;
        catscope.liquiddensity_B=0.2241;
        catscope.liquiddensity_C=638;
        catscope.liquiddensity_N=0.2015;

        catscope.liquidheatcapacity_A=125185;
        catscope.liquidheatcapacity_B=579.79;
        catscope.liquidheatcapacity_C=-1.5031;
        catscope.liquidheatcapacity_D=1.8061*0.001;
        catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i]== "Diethanolamine"){
        catscope.viscosity_A=-0.402222;
        catscope.viscosity_B=0.156346;
        catscope.viscosity_C=1.08268*0.00001;
        catscope.viscosity_D=-1.25782*0.00000001;

        catscope.thermalconductivity_A=-0.00083944;
        catscope.thermalconductivity_B=7.29848*0.000001;
        catscope.thermalconductivity_C=3.47851*0.00000001;
        catscope.thermalconductivity_D=-1.19117*0.00000000001;

        catscope.heatcapacity_A=-5.264;
        catscope.heatcapacity_B=6.1929*0.1;
        catscope.heatcapacity_C=-4.9545*0.0001;
        catscope.heatcapacity_D=2.179*0.0000001;
        catscope.heatcapacity_E=-3.8987*0.00000000001;
        catscope.heatcapacity_F=0;
        catscope.heatcapacity_G=0;

        catscope.molecular_weight=105.137;

        catscope.crtitcal_temperature=715;
        catscope.crtitcal_pressure=32.7;

        catscope.liquidviscosity_A=-27.939;
        catscope.liquidviscosity_B=5.9547*1000;
        catscope.liquidviscosity_C=0.0441;
        catscope.liquidviscosity_D=-2.5871*0.00001;

        catscope.liquidthermalconductivity_A=0.2011;
        catscope.liquidthermalconductivity_B=-2.6739*0.00001;
        catscope.liquidthermalconductivity_C=-2.6681*0.0000001;

        catscope.liquiddensity_A=0.3013;
        catscope.liquiddensity_B=0.2397;
        catscope.liquiddensity_C=715;
        catscope.liquiddensity_N=0.1892;

        catscope.liquidheatcapacity_A=76703;
        catscope.liquidheatcapacity_B=1082.1;
        catscope.liquidheatcapacity_C=-2.486;
        catscope.liquidheatcapacity_D=2.2497*0.001;
        catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i]== "Triethanolamine"){
        catscope.viscosity_A=1.48764;
        catscope.viscosity_B=0.132255;
        catscope.viscosity_C=2.31822*0.00001;
        catscope.viscosity_D=-1.53728*0.00000001;

        catscope.thermalconductivity_A=-0.000816056;
        catscope.thermalconductivity_B=6.25183*0.000001;
        catscope.thermalconductivity_C=3.00459*0.00000001;
        catscope.thermalconductivity_D=-1.0875*0.00000000001;

        catscope.heatcapacity_A=37.73;
        catscope.heatcapacity_B=4.9155*0.1;
        catscope.heatcapacity_C=3.5952*0.0001;
        catscope.heatcapacity_D=-8.229*0.0000001;
        catscope.heatcapacity_E=3.5374*0.0000000001;
        catscope.heatcapacity_F=0;
        catscope.heatcapacity_G=0;

        catscope.molecular_weight=149.19;

        catscope.crtitcal_temperature=787;
        catscope.crtitcal_pressure=24.5;

        catscope.liquidviscosity_A=-21.008;
        catscope.liquidviscosity_B=4.7935*1000;
        catscope.liquidviscosity_C=0.0313;
        catscope.liquidviscosity_D=-1.7784*0.00001;

        catscope.liquidthermalconductivity_A=0.2;
        catscope.liquidthermalconductivity_B=3.9647*0.00001;
        catscope.liquidthermalconductivity_C=-1.8958*0.0000001;

        catscope.liquiddensity_A=0.3161;
        catscope.liquiddensity_B=0.248;
        catscope.liquiddensity_C=787;
        catscope.liquiddensity_N=0.2035;

        catscope.liquidheatcapacity_A=256171;
        catscope.liquidheatcapacity_B=884.23;
        catscope.liquidheatcapacity_C=-2.0352;
        catscope.liquidheatcapacity_D=2.0205*0.001;
        catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i]== "Methyl Diethanolamine"){
        catscope.viscosity_A=-1.38141;
        catscope.viscosity_B=0.149471;
        catscope.viscosity_C=1.83518*0.000001;
        catscope.viscosity_D=-9.0405*0.000000001;

        catscope.thermalconductivity_A=-0.000558967;
        catscope.thermalconductivity_B=5.8081*0.000001;
        catscope.thermalconductivity_C=1.99975*0.00000001;
        catscope.thermalconductivity_D=-6.91068*0.000000000001;

        catscope.heatcapacity_A=-16.817;
        catscope.heatcapacity_B=7.4349*0.1;
        catscope.heatcapacity_C=-5.5635*0.0001;
        catscope.heatcapacity_D=2.154*0.0000001;
        catscope.heatcapacity_E=-3.4622*0.00000000001;
        catscope.heatcapacity_F=0;
        catscope.heatcapacity_G=0;

        catscope.molecular_weight=119.164;

        catscope.crtitcal_temperature=678;
        catscope.crtitcal_pressure=38.8;

        catscope.liquidviscosity_A=-18.285;
        catscope.liquidviscosity_B=3.7119*1000;
        catscope.liquidviscosity_C=0.0326;
        catscope.liquidviscosity_D=-2.2985*0.00001;

        catscope.liquidthermalconductivity_A=0.1966;
        catscope.liquidthermalconductivity_B=-4.1918*0.00001;
        catscope.liquidthermalconductivity_C=-2.7032*0.0000001;

        catscope.liquiddensity_A=0.3225;
        catscope.liquiddensity_B=0.2543;
        catscope.liquiddensity_C=678;
        catscope.liquiddensity_N=0.2857;

        catscope.liquidheatcapacity_A=183050;
        catscope.liquidheatcapacity_B=1230;
        catscope.liquidheatcapacity_C=-3.1521;
        catscope.liquidheatcapacity_D=3.558*0.001;
        catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i]== "2,4-Diaminotoluene"){
        catscope.viscosity_A=2.58603;
        catscope.viscosity_B=0.177128;
        catscope.viscosity_C=3.52214*0.00001;
        catscope.viscosity_D=-2.19445*0.00000001;

        catscope.thermalconductivity_A=-0.00433594;
        catscope.thermalconductivity_B=2.6517*0.00001;
        catscope.thermalconductivity_C=6.22903*0.00000001;
        catscope.thermalconductivity_D=-2.16891*0.00000000001;

        catscope.heatcapacity_A=-7.544*10;
        catscope.heatcapacity_B=1.0663;
        catscope.heatcapacity_C=-1.1548*0.001;
        catscope.heatcapacity_D=6.104*0.0000001;
        catscope.heatcapacity_E=-1.1054*0.0000000001;
        catscope.heatcapacity_F=0;
        catscope.heatcapacity_G=0;

        catscope.molecular_weight=122.17;

        catscope.crtitcal_temperature=804;
        catscope.crtitcal_pressure=43.8;

        catscope.liquidviscosity_A=-32.606;
        catscope.liquidviscosity_B=6.0305*1000;
        catscope.liquidviscosity_C=0.0565;
        catscope.liquidviscosity_D=-3.3463*0.00001;

        catscope.liquidthermalconductivity_A=0.1671;
        catscope.liquidthermalconductivity_B=-2.6311*0.00001;
        catscope.liquidthermalconductivity_C=-1.6763*0.0000001;

        catscope.liquiddensity_A=0.3245;
        catscope.liquiddensity_B=0.2467;
        catscope.liquiddensity_C=804;
        catscope.liquiddensity_N=0.2857;

        catscope.liquidheatcapacity_A=105141;
        catscope.liquidheatcapacity_B=990.94;
        catscope.liquidheatcapacity_C=-1.9691;
        catscope.liquidheatcapacity_D=1.732*0.001;
        catscope.liquidheatcapacity_E=0;

    }else if(catscope.common_used_gas_type_array[i]== "Cumene"){
        catscope.viscosity_A=-12.5586;
        catscope.viscosity_B=0.260909;
        catscope.viscosity_C=-5.4235*0.00001;
        catscope.viscosity_D=6.1617*0.000000001;

        catscope.thermalconductivity_A=0.00170313;
        catscope.thermalconductivity_B=3.67395*0.00001;
        catscope.thermalconductivity_C=8.25141*0.00000001;
        catscope.thermalconductivity_D=-3.02659*0.00000000001;

        catscope.heatcapacity_A=10.149;
        catscope.heatcapacity_B=5.1138*0.1;
        catscope.heatcapacity_C=-1.7703*0.00001;
        catscope.heatcapacity_D=-2.261*0.0000001;
        catscope.heatcapacity_E=8.8002*0.00000000001;
        catscope.heatcapacity_F=0;
        catscope.heatcapacity_G=0;

        catscope.molecular_weight=120.194;

        catscope.crtitcal_temperature=631.15;
        catscope.crtitcal_pressure=32.09;

        catscope.liquidviscosity_A=-5.9339;
        catscope.liquidviscosity_B=963.84;
        catscope.liquidviscosity_C=0.011916;
        catscope.liquidviscosity_D=-1.11*0.00001;

        catscope.liquidthermalconductivity_A=0.182616;
        catscope.liquidthermalconductivity_B=-0.0002168;
        catscope.liquidthermalconductivity_C=3.42*0.00000001;

        catscope.liquiddensity_A=0.2824;
        catscope.liquiddensity_B=0.2618;
        catscope.liquiddensity_C=631.15;
        catscope.liquiddensity_N=0.29;

        catscope.liquidheatcapacity_A=124621;
        catscope.liquidheatcapacity_B=633;
        catscope.liquidheatcapacity_C=-1.73;
        catscope.liquidheatcapacity_D=2.21*0.001;
        catscope.liquidheatcapacity_E=0;

    }else{
      catscope.viscosity_A=0;
      catscope.viscosity_B=0;
      catscope.viscosity_C=0;
      catscope.viscosity_D=0;


      catscope.thermalconductivity_A=0;
      catscope.thermalconductivity_B=0;
      catscope.thermalconductivity_C=0;
      catscope.thermalconductivity_D=0;

      catscope.heatcapacity_A=0;
      catscope.heatcapacity_B=0;
      catscope.heatcapacity_C=0;
      catscope.heatcapacity_D=0;
      catscope.heatcapacity_E=0;
      catscope.heatcapacity_F=0;
      catscope.heatcapacity_G=0;

      catscope.molecular_weight=1;

      catscope.crtitcal_temperature=0;
      catscope.crtitcal_pressure=0;

      catscope.liquidviscosity_A=0;
      catscope.liquidviscosity_B=0;
      catscope.liquidviscosity_C=0;
      catscope.liquidviscosity_D=0;

      catscope.liquidthermalconductivity_A=0;
      catscope.liquidthermalconductivity_B=0;
      catscope.liquidthermalconductivity_C=0;

      catscope.liquiddensity_A=0;
      catscope.liquiddensity_B=0;
      catscope.liquiddensity_C=0;
      catscope.liquiddensity_N=0;

      catscope.liquidheatcapacity_A=0;
      catscope.liquidheatcapacity_B=0;
      catscope.liquidheatcapacity_C=0;
      catscope.liquidheatcapacity_D=0;
      catscope.liquidheatcapacity_E=0;
    }

    common_used_gashc_calc[i]=math.eval('heatcapacity_A+heatcapacity_B*temp+heatcapacity_C*(temp^2)+heatcapacity_D*(temp^3)+heatcapacity_E*(temp^4)+heatcapacity_F*(temp^5)+heatcapacity_G*(temp^6)',catscope);
    common_used_gashc_mw[i]=math.eval('molecular_weight',catscope);

    catscope.common_used_gashc_calc_i=common_used_gashc_calc[i];
    catscope.common_used_gashc_mw_i=common_used_gashc_mw[i];

    common_used_gasliquidhc_calc[i]=math.eval('liquidheatcapacity_A+liquidheatcapacity_B*temp+liquidheatcapacity_C*(temp^2)+liquidheatcapacity_D*(temp^3)+liquidheatcapacity_E*(temp^4)',catscope);
    common_used_gasliquidhc_mw[i]=math.eval('molecular_weight/1',catscope);

    catscope.common_used_gasliquidhc_calc_i=common_used_gasliquidhc_calc[i];
    catscope.common_used_gasliquidhc_mw_i=common_used_gasliquidhc_mw[i];

    common_used_gasv[i]=math.eval('(viscosity_A+viscosity_B*temp+viscosity_C*(temp^2)+viscosity_D*temp^3)/10000000',catscope);
    common_used_gastc[i]=math.eval('thermalconductivity_A+thermalconductivity_B*temp+thermalconductivity_C*(temp^2)+thermalconductivity_D*(temp)^3',catscope);
    common_used_gashc[i]=math.eval('common_used_gashc_calc_i*1000/common_used_gashc_mw_i',catscope);
    common_used_gasd[i]=math.eval('pressure*molecular_weight*100000/(temp*8.314)',catscope);
    common_used_gasct[i]=math.eval('crtitcal_temperature',catscope);
    common_used_gascp[i]=math.eval('crtitcal_pressure',catscope);
    common_used_gasliquidv[i]=math.eval('(10^(liquidviscosity_A+liquidviscosity_B/temp+liquidviscosity_C*temp+liquidviscosity_D*(temp^2)))/1000',catscope);
    common_used_gasliquidtc[i]=math.eval('liquidthermalconductivity_A+liquidthermalconductivity_B*temp+liquidthermalconductivity_C*(temp^2)',catscope);
    common_used_gasliquidd[i]=math.eval('1000*(liquiddensity_A*liquiddensity_B^(-(1-temp/liquiddensity_C)^liquiddensity_N))',catscope);
    common_used_gasliquidhc[i]=math.eval('common_used_gasliquidhc_calc_i/common_used_gasliquidhc_mw_i',catscope);


    }
    return [common_used_gasv,common_used_gastc,common_used_gashc, common_used_gasd, common_used_gasct, common_used_gascp, common_used_gasliquidv, common_used_gasliquidtc, common_used_gasliquidd, common_used_gasliquidhc];
}
