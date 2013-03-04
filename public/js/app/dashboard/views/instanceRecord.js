
var app = app || {};

app.InstanceRecordView = Backbone.View.extend({
  initialize: function () {
    console.log("-----InstanceRecord Initialization");
    this.listenTo(this.model, 'destroy', this.remove);
    this.listenTo(this.model, 'change', function () {
      console.log("-------Instance Model: Change detected!");
      this.render();
    });
  },

  events: {
    "click .refresh" : "refreshRecord",
    "click .start"   : "startInstance",
    "click .shutdown": "shutdownInstance",
    "click .resume"  : "resumeInstance",
    "click .suspend" : "suspendInstance",
    "click .destroy" : "destroyInstance"
  },

  template: _.template($('#instance-record-template').html()),

  render: function () {
    console.log("------Rendering instance view!");

    this.$el.html( this.template(this.model.toJSON()) );

    console.log("      ...rendered!");

    return this;
  },

  refreshRecord: function(){
    this.model.fetch();
  },

  startInstance: function(){
    var self = this;
    app.API.callServer("start/" + self.model.get("ip") + "/" + self.model.get("id"),
      function (data, textStatus, jqXHR) {
        if (data.err) {
          console.log("daemon error:" + data.err); 
          toastr.error("VIRSH: " + data.err);

          return;
        }

        toastr.success("VIRSH: " + data.data);

        console.log( "Start Instance:" + self.model.get("id") );
        console.log(data);
        console.log( "    VIRSH:" + data.data);
        self.refreshRecord();
      },
      function () {
        toastr.error("Error communicating with interface-server");
        console.log( "XX Error communicating with interface-server! XX");
      });
  },

  shutdownInstance: function(){
    var self = this;
    app.API.callServer("shutdown/" + self.model.get("ip") + "/" + self.model.get("id"),
      function (data, textStatus, jqXHR) {
        if (data.err) {
          console.log("daemon error:" + data.err); 
          toastr.error("VIRSH: " + data.err);

          return;
        }

        toastr.success("VIRSH: " + data.data);

        console.log( "Shutdown Instance:" + self.model.get("id") );
        console.log(data);
        console.log( "    VIRSH:" + data.data);

        // Update model
        self.model.fetch();
      },
      function () {
        toastr.error("Error communicating with interface-server");
        console.log( "XX Error communicating with interface-server! XX");
      });
  },

  resumeInstance: function(){
    var self = this;
    app.API.callServer("resume/" + self.model.get("ip") + "/" + self.model.get("id"),
      function (data, textStatus, jqXHR) {
        if (data.err) {
          console.log("daemon error:" + data.err); 
          toastr.error("VIRSH: " + data.err);

          return;
        }

        toastr.success("VIRSH: " + data.data);

        console.log( "Shutdown Instance:" + self.model.get("id") );
        console.log(data);
        console.log( "    VIRSH:" + data.data);

        // Update model
        self.model.fetch();
      },
      function () {
        toastr.error("Error communicating with interface-server");
        console.log( "XX Error communicating with interface-server! XX");
      });
  },

  suspendInstance: function(){
    var self = this;
    app.API.callServer("suspend/" + self.model.get("ip") + "/" + self.model.get("id"),
      function (data, textStatus, jqXHR) {
        if (data.err) {
          console.log("daemon error:" + data.err); 
          toastr.error("VIRSH: " + data.err);

          return;
        }

        toastr.success("VIRSH: " + data.data);

        console.log( "Shutdown Instance:" + self.model.get("id") );
        console.log(data);
        console.log( "    VIRSH:" + data.data);

        // Update model
        self.model.fetch();
      },
      function () {
        toastr.error("Error communicating with interface-server");
        console.log( "XX Error communicating with interface-server! XX");
      });
  },

  destroyInstance: function(){
    var self = this;
    app.API.callServer("destroy/" + self.model.get("ip") + "/" + self.model.get("id"),
      function (data, textStatus, jqXHR) {
        if (data.err) {
          console.log("daemon error:" + data.err); 
          toastr.error("VIRSH: " + data.err);

          return;
        }

        toastr.success("VIRSH: " + data.data);

        console.log( "Shutdown Instance:" + self.model.get("id") );
        console.log(data);
        console.log( "    VIRSH:" + data.data);

        // Update model
        self.model.fetch();
      },
      function () {
        toastr.error("Error communicating with interface-server");
        console.log( "XX Error communicating with interface-server! XX");
      });
  },

});
