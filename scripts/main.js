Vue.use(VueResource); //Required for GET requests to dweet.io

let app = new Vue({
  el: "#vue",
  data: {
    thingName: "echook", //Dweet Thing name
    buttonText: "Go!",
    status: "Not Connected",
    dweet: { // This holds the latest data from dweet and is accessible in HTML with {{dweet.dataName}}
      updated: 0,
      voltage: 0,
      voltageLow: 0,
      voltageHigh: 0,
      current: 0,
      rpm: 0,
      speed: 0,
      t1: 0,
      t2: 0,
      ampHours: 0,
      lap: 0,
      gear: 0,
      brake: 0,
      throttle: 0
    },
    polling: null
  },
  methods: {
    getData: function() {
      // This function is called perioducally and asks dweet for the latest data for your thing Name
      // It checks if the data is new, and if it is passes it to the updateData function.
      // It also updates the "satus" text if errors occur.
      var self = this;
      this.$http.get(`https://dweet.io/get/latest/dweet/for/${this.thingName}`).then(function(response) {
        if (response.status == "200") {
          // console.log(response.data);
          if (response.data.this === "succeeded" && response.data.with[0].created != this.dweet.updated) {
            // If data request succeeded, and time stamp isn't the same as the current data
            this.dweet.updated = response.data.with[0].created; //Update last updated time
            this.status = `Getting Dweets from ${this.thingName}, updated: ${this.dweet.updated}`; //Update Status text
            if (this.polling != null) { // after stop is presse previously requested data may still be coming in
              this.updateData(response.data.with[0].content); //Call updateData function, passing new data from dweet data
            }
          } else if (response.data.this === "failed") { //if response failed, update status with reason
            this.status = `Request failed with error: ${response.data.because}`
          }
        }
      })
    },
    startDweet: function() {
      // This function is called when you press the go/stop button.
      if (this.polling === null) {
        // The polling variable holds the repeating function call to dweet.
        // if it is null, we're not requesting data, so the button needs to start requesting
        this.status = `Getting Dweets from ${this.thingName}`; // Updates status with the thing name being used`
        this.buttonText = "Stop"; //Changes button text to stop
        console.log(`Start Polling`);
        this.getData() // First request before poll interval, otherwise it waits the poll interval before first request
        this.polling = setInterval(() => {
          this.getData();
        }, 5000); // Calls getData every 5000ms
      } else {
        //Polling != null, therefore we have pressed the stop button
        console.log("Stop");
        clearInterval(this.polling) // Stops polling
        this.polling = null; // Sets polling variable to null
        this.status = "Idle"; // Sets Status Text
        this.buttonText = "Go!"; // Sets buttont text

      }

    },
    updateData: function(data) {
      if (data.Vt != undefined) this.dweet.voltage = data.Vt;
      if (data.V1 != undefined) this.dweet.voltageLow = data.V1;
      if (data.V1 != undefined) this.dweet.voltagehigh = data.Vt - data.V1;
      if (data.A != undefined) this.dweet.current = data.A;
      if (data.RPM != undefined) this.dweet.rpm = data.RPM;
      if (data.Spd != undefined) this.dweet.speed = data.Spd;
      if (data.Thrtl != undefined) this.dweet.throttle = data.Thrtl;
      if (data.Tmp1 != undefined) this.dweet.t1 = data.Tmp1;
      if (data.Tmp2 != undefined) this.dweet.t2 = data.Tmp2;
      if (data.AH != undefined) this.dweet.ampHours = data.AH;
      if (data.Lap != undefined) this.dweet.lap = data.Lap;
      if (data.Gear != undefined) this.dweet.gear = data.Gear;
      if (data.Brk != undefined) this.dweet.brake = data.Brk;
    }
  },
  beforeDestroy() {
    clearInterval(this.polling)
  }

})