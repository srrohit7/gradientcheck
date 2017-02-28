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

$(document).ready(function(){
///////////////////////////////////////
//molecular formula input
  $("#mol_formula,#mol_formula2,#temp,#pressure").keyup(function(){
    //inputs
    var mol_formula = $("#mol_formula").val();
    var mol_formula2 = $("#mol_formula2").val();
    var temp = $("#temp").val().toNum();
    var pressure = $("#pressure").val().toNum();
    
    var mnum_out = parseChemFormula(mol_formula); //next few pairs are for calling subroutines.js
    var mnum_out2 = parseChemFormula(mol_formula2);

    var diffv_1 = diffusionVolume(mnum_out);
    var diffv_2 = diffusionVolume(mnum_out2);

    var mw_1 = molecularWeight(mnum_out);
    var mw_2 = molecularWeight(mnum_out2);    

    var mw_out1 = $("#res_molweight"); //define output area
    var mw_out2 = $("#res_molweight2");

    mw_out1.val(mw_1); //actually set output to value
    mw_out2.val(mw_2);

    var res_DAB = fullerBinaryDiff(mw_1,mw_2,temp,pressure,diffv_1,diffv_2); //
    var res_DAB_out = $("#res_DAB");
    res_DAB_out.val(res_DAB);

    //legacy code for later function:
    $("#sum_v").val(diffv_1);
    
  });



 
  
/////////////////////////////////////////
// RECALCULATE FOR D_AC fixed event handling --needs to be refactored with new functions
  $("#dr_molname,#mol_formula,#temp,#pressure").on('keyup change', function () {
    //inputs    
    var dr_molname = $("#dr_molname option:selected").attr("name")  
    var mol_formula = $("#mol_formula").val();
    var temp = $("#temp").val().toNum();
    var pressure = $("#pressure").val().toNum();
    var sum_v = $("#sum_v").val().toNum();  
      
    pre_def_names = ["N2","O2","Air","H2O","CO","CO2","H2","He","Ar","N2O","NH3","Cl2","Br2","SO2"];
    pre_def_dvols = [18.5,16.3,19.7,13.1,18.0,26.9,6.1,2.7,16.2,35.9,20.7,38.4,69.0,41.8];
    pre_def_MWs = [28.014,31.998,28.966,18.016,28.01,44.009,2.016,4.0026,39.948,44.013,17.031,70.906,159.808,64.064];
    
    var j = pre_def_names.indexOf(dr_molname);
    
    var res_molweight3 = $("#res_molweight3");
    res_molweight3.val(pre_def_MWs[j]);
    var dvol = pre_def_dvols[j];
    /////////////////////////////
    
    var res_molweight = $("#res_molweight");
    
    a = res_molweight.val().toNum();
    b = res_molweight3.val().toNum();
    
    var res_DAC = $("#res_DAC");
    
    numerator = math.multiply(0.00143,math.pow(temp,1.75));

    //test if any test is false, else do not perform m.pow
    if (!dvol || !sum_v) { 
      var inner = 1;
    } else {
      var inner = math.add(math.pow(dvol,1/3),math.pow(sum_v,1/3));
    }
   
    
    MA = math.divide(1,b);
    MB = math.divide(1,a);
    MAB = math.multiply(2,math.pow(MA+MB,-1));
    
    res_DAC.val(math.divide(numerator,pressure*math.pow(MAB,0.5)*math.pow(inner,2)));
  });





///////////////////////////////////////  
//small function for conversion of strings to floating point numbers
  String.prototype.toNum = function(){
      return parseFloat(this);
  }
  
///////////////////////////////////////  
//small function for tooltips
  $(function () {
      $(document).tooltip({
          content: function () {
              return $(this).prop('title');
          }
      });
  });


/////////////////////////////////////// /////////////////////////////////////// /////////////////////////////////////// 
/////////////////////////////////////// /////////////////////////////////////// /////////////////////////////////////// 


///////////////////////////////////////  
//call subroutine for critical property estimation on button press
  $("#but_crtprop1").on('click', function (){    
    //input
    var smiles = $("#mol_smiles").val();
    
    //define output areas via jQuery
    var res_tcritical_out = $("#res_tcritical");
    var res_pcritical_out = $("#res_pcritical");
    var res_zcritical_out = $("#res_zcritical");

    umansyspropClient(smiles).done(function(result){
      var res_tcritical = result[0].data[0].value; //critical temp in Kelvin
      var res_pcritical = result[1].data[0].value; //critical pressure in bar
      var res_vcritical = result[2].data[0].value; //available but unused critical volume in cm^3/mol
      var res_zcritical = result[3].data[0].value; //critical z is unitless
      
      //actually write the result to the appropriate field
      res_tcritical_out.val(res_tcritical);
      res_pcritical_out.val(res_pcritical);
      res_zcritical_out.val(res_zcritical);

    }).fail(function(){
      console.log("jQuery deferred object error - Critical Properties")
    });
  });


///////////////////////////////////////  
//call subroutine for critical property estimation on button press
  $("#but_crtprop2").on('click', function (){    
    //input
    var smiles = $("#mol_smiles2").val();
    
    //define output areas via jQuery
    var res_tcritical_out = $("#res_tcritical2");
    var res_pcritical_out = $("#res_pcritical2");
    var res_zcritical_out = $("#res_zcritical2");

    umansyspropClient(smiles).done(function(result){
      var res_tcritical = result[0].data[0].value; //critical temp in Kelvin
      var res_pcritical = result[1].data[0].value; //critical pressure in bar
                                                   //available but unused critical volume in cm^3/mol
      var res_zcritical = result[3].data[0].value; //critical z is unitless

      //actually write the result to the appropriate field
      res_tcritical_out.val(res_tcritical);
      res_pcritical_out.val(res_pcritical);
      res_zcritical_out.val(res_zcritical);
    }).fail(function(){
      console.log("jQuery deferred object error - Critical Properties")
    });
  });

///////////////////////////////////////  
//call subroutine for critical property estimation on button press
  $("#but_crtprop3").on('click', function (){    
    //input
    var smiles = $("#mol_smiles3").val();
    
    //define output areas via jQuery
    var res_tcritical_out = $("#res_tcritical3");
    var res_pcritical_out = $("#res_pcritical3");
    var res_zcritical_out = $("#res_zcritical3");

    umansyspropClient(smiles).done(function(result){
      var res_tcritical = result[0].data[0].value; //critical temp in Kelvin
      var res_pcritical = result[1].data[0].value; //critical pressure in bar
                                                   //available but unused critical volume in cm^3/mol
      var res_zcritical = result[3].data[0].value; //critical z is unitless

      //actually write the result to the appropriate field
      res_tcritical_out.val(res_tcritical);
      res_pcritical_out.val(res_pcritical);
      res_zcritical_out.val(res_zcritical);
    }).fail(function(){
      console.log("jQuery deferred object error - Critical Properties")
    });
  });


///////////////////////////////////////
//calculate gas viscosities for A 
//-- ONLY DEPENDS ON CHANGE FOR TCRITICAL NEED TO FIX!!!!
  $("#res_molweight,#temp,#pressure,#diplmom1,#res_tcritical").on('keyup keydown change', function (){
    //inputs
    var temp = $("#temp").val().toNum();
    var criticalt = $("#res_tcritical").val().toNum(); //Kelvin
    var criticalp = $("#res_pcritical").val().toNum(); //bar
    var criticalz = $("#res_zcritical").val().toNum(); //unitless
    var diplmom = $("#diplmom1").val().toNum(); //debye
    var mw = $("#res_molweight").val().toNum(); //read values from appropriate cells

    //define output areas via jQuery
    var res_gasvisc_out = $("#res_gasvisc1");

    var res_gasvisc = lucasGasViscosity(mw,temp,criticalt,criticalp,criticalz,diplmom);

    //actually write the result to the appropriate field
    res_gasvisc_out.val(res_gasvisc)
  });

///////////////////////////////////////
//calculate gas viscosities for B 
//-- ONLY DEPENDS ON CHANGE FOR TCRITICAL NEED TO FIX!!!!
  $("#res_molweight2,#temp,#pressure,#diplmom2,#res_tcritical2").on('keyup keydown change', function (){
    //inputs
    var temp = $("#temp").val().toNum();
    var criticalt = $("#res_tcritical2").val().toNum(); //Kelvin
    var criticalp = $("#res_pcritical2").val().toNum(); //bar
    var criticalz = $("#res_zcritical2").val().toNum(); //unitless
    var diplmom = $("#diplmom2").val().toNum(); //debye
    var mw = $("#res_molweight2").val().toNum(); //read values from appropriate cells

    //define output areas via jQuery
    var res_gasvisc_out = $("#res_gasvisc2");

    var res_gasvisc = lucasGasViscosity(mw,temp,criticalt,criticalp,criticalz,diplmom);

    //actually write the result to the appropriate field
    res_gasvisc_out.val(res_gasvisc)
  });

  ///////////////////////////////////////
//calculate gas viscosities for C 
//-- ONLY DEPENDS ON CHANGE FOR TCRITICAL NEED TO FIX!!!!
  $("#res_molweight3,#temp,#pressure,#diplmom3,#res_tcritical3").on('keyup keydown change', function (){
    //inputs
    var temp = $("#temp").val().toNum();
    var criticalt = $("#res_tcritical3").val().toNum(); //Kelvin
    var criticalp = $("#res_pcritical3").val().toNum(); //bar
    var criticalz = $("#res_zcritical3").val().toNum(); //unitless
    var diplmom = $("#diplmom3").val().toNum(); //debye
    var mw = $("#res_molweight3").val().toNum(); //read values from appropriate cells

    //define output areas via jQuery
    var res_gasvisc_out = $("#res_gasvisc3");

    var res_gasvisc = lucasGasViscosity(mw,temp,criticalt,criticalp,criticalz,diplmom);

    //actually write the result to the appropriate field
    res_gasvisc_out.val(res_gasvisc)
  });
});
