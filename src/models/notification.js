const mongoose = require('mongoose')
const validator = require('validator')

const Schema = mongoose.Schema

NOTIFICATIONTYPE = [
    'MESSAGE',
    'INVITE',
    'JOINREQ'
 ]

const notificationSchema = new Schema({
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    is_read: { type: Boolean, default: false },
    body: {type: String, required: true},
    subject: {type: String, required: true},
    notification_type: {type: String, enum: NOTIFICATIONTYPE, default: NOTIFICATIONTYPE[0]},
    study: {type: Schema.Types.ObjectId, ref: 'StudyGroup', required: false}
}, {timestamps: true})

notificationSchema.index({ name: 'text', description: 'text' });


notificationSchema.methods.toJSON = function () {
    const notification = this
    const notificationObject = notification.toObject()

    delete notificationObject.__v
    return notificationObject
}




const Notification = mongoose.model('Notification', notificationSchema)
module.exports = Notification