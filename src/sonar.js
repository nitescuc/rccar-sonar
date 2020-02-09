const EventEmitter = require('events');
const Gpio = require('pigpio').Gpio;

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6/34321;

class SonarReader extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        if (this.config.triggerPin) {
            this.trigger = new Gpio(this.config.triggerPin, {mode: Gpio.OUTPUT});
            this.trigger.digitalWrite(0); // Make sure trigger is low    
        }
        this.echo = new Gpio(this.config.echoPin, {mode: Gpio.INPUT, alert: true});
        this.echo.pullUpDown(Gpio.PUD_UP);
        this.echo.on('alert', (level, tick) => {
            if (level == 1) {
                this.startTick = tick;
            } else {
                const endTick = tick;
                const diff = (endTick >> 0) - (this.startTick >> 0); // Unsigned 32 bit arithmetic
                this.distance = diff / 2 / MICROSECDONDS_PER_CM;

                this.emit('distance', this.getDistance());
            }
        });
    }
    getDistance() {
        return Math.round(this.distance);
    }
    update() {
        if (this.config.triggerPin) {
            this.trigger.trigger(10, 1);                    
        }
    }
}

module.exports = { SonarReader };