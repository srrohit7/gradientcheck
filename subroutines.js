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


function parseChemFormula(mol_formula) {
  //regular expression for matching chemical formulas
  var reg_molf = /\(?([a-zA-Z]{1,2})([0-9]*)/gmi; 
  var reg_molfC = /\(?([a-zA-Z]{1,2})[0-9]*/gmi //match letters
  var reg_molfN = /\(?[a-zA-Z]{1,2}([0-9]*)/gmi //match numbers   

  /////////////////////////////////////////
  //get array of characters for molecule
  var mchar = reg_molfC.exec(mol_formula);
  var mchar2 = [];
  var i = 0;
    
  while(mchar !== null) {
    mchar2[i] = mchar[1];
    mchar = reg_molfC.exec(mol_formula);
    i++;
  }
  mchar = $.extend( true, {}, mchar2);

  /////////////////////////////////////////
  //get array of numbers for molecule
  var mnum = reg_molfN.exec(mol_formula);
  var mnum2 = [];
  var i = 0;
    
  while(mnum !== null) {
    mnum2[i] = mnum[1];
    mnum = reg_molfN.exec(mol_formula);
    i++;
  }
  mnum = mnum2;
  mnum = mnum.map(Number); // convert to array of integers

  /////////////////////////////////////////
  var MW_array_labels = ["C", "H", "O", "N", "S", "F", "Cl", "Br", "I"]; //
  var mnum_out = [0,0,0,0,0,0,0,0,0]; //same length (9) as above
  
  /////////////////////////////////////////
  // make mw_temp array for mol#1
  var i = 0;

  while (mchar2[i]) {
    var j = MW_array_labels.indexOf(mchar2[i]);
    mnum_out[j] = mnum_out[j] + mnum[i];
    i++;
  }
  
  return mnum_out; //return mnum_out array with number of element in ordered 9-lenght array
  console.log(mnum_out);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function diffusionVolume(mnum_out) {
  var diff_vol = [15.9, 2.3, 6.1, 4.5, 22.9, 14.7, 21.0, 21.9, 29.8]; // missing Aromatic Ring and Hetero Ring [-18.3,-18.3]
  
  //test if all tests are true, else do not perform m.multiply
  if (math.sum(mnum_out) > 0) { 
    var diffv = math.multiply(diff_vol,mnum_out); //calculate volume sum
  }
  
  return diffv;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function molecularWeight(mnum_out) {
  //same order of elements as above
  var MW_array = [12.011, 1.008, 15.999, 14.007, 32.066, 18.998, 35.453, 79.904, 126.905]; //  
  

  //test if all tests are true, else do not perform m.multiply
  if (math.sum(mnum_out) > 0) { 
    var mw = math.multiply(mnum_out,MW_array);
  }

  return mw;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function fullerBinaryDiff(mw_1,mw_2,temp,pressure,diffv_1,diffv_2) {

  //test if any test is false, else do not perform m.pow
  if (!diffv_1 || !diffv_2) { 
    var inner = 1;
  } else {
    var inner = math.add(math.pow(diffv_1,1/3),math.pow(diffv_2,1/3));
  }
    
  numerator = math.multiply(0.00143,math.pow(temp,1.75));
    
  if (typeof mw_1 !== 'undefined' && typeof mw_2 !== 'undefined') {
    // the variable is defined
    MA = math.divide(1,mw_1);
    MB = math.divide(1,mw_2);
  } else {
    MA=0;
    MB=0;
  }


  MAB = math.multiply(2,math.pow(MA+MB,-1));
  var res_DAB = math.divide(numerator,pressure*math.pow(MAB,0.5)*math.pow(inner,2));

  return res_DAB;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function idealGasDensity(mw,temp,pressure) {

  var R = 8.3145; //J per mol per K --or-- m^3 * Pa per mol per K
  var pressure_Pa = math.multiply(pressure,100000); //convert to Pascals from bar
  
  //might need additional error handling
    
  ig_density = math.divide(pressure_Pa*mw,R*temp*1000);

  return ig_density;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function lucasGasViscosity(mw,temp,criticalt,criticalp,criticalz,diplmom) {
  //mw in g/mol
  //temp in kelvin; criticalt too
  //criticalp in bar
  //criticalz is unitless
  //diplmom in debye

  reducedt = math.divide(temp,criticalt);
  mu_r = math.divide(52.46*math.pow(diplmom,2)*criticalp,math.pow(criticalt,2));

  fp0_1 = 1;
  fp0_2 = math.add(1,math.multiply(30.55,math.pow(.292-criticalz,1.72)));
  fp0_3 = math.add(1,math.multiply(30.55*math.abs(0.96+0.1*(reducedt-0.7)),math.pow(.292-criticalz,1.72)));
  

  //if none of these are true then fp0 shouldnt exist and might throw error
  if (mu_r >= 0 && mu_r < 0.022){ 
    fp0 = fp0_1;
  } else if (mu_r >= 0.022 && mu_r < 0.075){
    fp0 = fp0_2;
  } else if (mu_r >= 0.075){
    fp0 = fp0_3;
  }


  xsi = math.multiply(0.176,math.pow(criticalt/math.pow(mw,3)/math.pow(criticalp,4),(1/6))); //"reduced inverse viscosity"
  eta_xsi = math.multiply(0.807*math.pow(reducedt,0.618)-0.357*math.exp(-0.449*reducedt)+0.340*math.exp(-4.058*reducedt)+0.018,fp0)
  eta = math.divide(eta_xsi,xsi); //viscosity in micro-poise

  eta_SIunits = math.divide(eta,1e7); //viscosity in kg/m/s

  return eta_SIunits;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function massXferCoeff(R_p,v_f,rho_f,D_AB,gas_visc) {
  var R = 8.3145; //J per mol per K --or-- m^3 * Pa per mol per K
  
  //R_p in m
  //v_f in m/s
  //rho_f kg/m^3
  //D_AB in m/s^2
  //gas_visc in kg/s/m

  Reynolds_p = math.divide(2*R_p*v_f*rho_f,gas_visc);

  //based upon Sh ~ Nu ~ 0.07*Reynolds_p 
  //(when Reynolds_p is between 0.1 and 1)
  if (Reynolds_p < 0.1){
    k_c = math.divide(.07*Reynolds_p*D_AB,2*R_p); // should return m per second
  } else {
    k_c = math.divide(.07*Reynolds_p*D_AB,2*R_p); // PLACEHOLDER TEMPORARY !! MAY VIOLATE CORRELATION !!
  }

  return k_c;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function mearsCriterion(rxn_order,rho_bulk,R_p,k_c,C_Ab,rate_A) {
  //rxn_order is unitless
  //rho_bulk is kg/m^3
  //R_p is in m
  //k_c is m/s
  //C_Ab is in kmol/m^3 (same as mol/L)
  //rate_A is in kmol/kgcat/s
  
  mearsCriterion = math.divide(-rate_A*rho_bulk*R_p*rxn_order,k_c*C_Ab); //this expression needs validation still
  

  //need to decide if logic for 0.15 should be here or in the higher level Javscript
  return mearsCriterion;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function umansyspropClient(smiles) {

    var json_input = {"properties_method": "nannoolal", "bp_method": "joback_and_reid", "compounds": [""]};

    json_input.compounds = [smiles];
    //jquery deffered object rather than Promise
    //the following code submits the json_input_template and returns the data
    return $.ajax({
          url: 'http://umansysprop.seaes.manchester.ac.uk/api/critical_property',
          type: "POST",
          data: JSON.stringify(json_input),
          dataType: 'json',
          complete: function(json_returned_data) {
            return json_returned_data;
          },
          error: function(error_text) {
            console.log("Update unsuccessful. Status: ", error_text);
          }
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// a fairly self explanatory function that tests for equality with unity
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


