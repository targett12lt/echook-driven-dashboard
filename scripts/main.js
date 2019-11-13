Vue.use(VueResource);

let app = new Vue({
  el: "#vue",
  data: {
    thingName: "echook",
    buttonText: "Go!",
    status: "Idle",
    dweet: {
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
      console.log(`polling`);
      var self = this;
      this.$http.get(`https://dweet.io/get/latest/dweet/for/${this.thingName}`).then(function(response) {
        if (response.status == "200") {
          // console.log(response.data.with[0].content);
          console.log(response.data);
          if (response.data.this === "succeeded" && response.data.with[0].created != this.dweet.updated) {
            this.dweet.updated = response.data.with[0].created;
            this.status = `Getting Dweets from ${this.thingName}, updated: ${this.dweet.updated}`
            if (this.polling != null) { // after stop is presse previously requested data may still be coming in
              this.updateData(response.data.with[0].content);
            }
          } else if (response.data.this === "failed") {
            this.status = `Request failed with error: ${response.data.because}`
          }
        }
      })
    },
    startDweet: function() {
      if (this.polling === null) {
        this.status = `Getting Dweets from ${this.thingName}`;
        this.buttonText = "Stop";
        console.log(`Start`);
        this.getData() // First request before poll interval
        this.polling = setInterval(() => {
          this.getData()
        }, 5000)
      } else {
        console.log("Stop");
        clearInterval(this.polling)
        this.polling = null;
        this.status = "Idle";
        this.buttonText = "Go!";

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