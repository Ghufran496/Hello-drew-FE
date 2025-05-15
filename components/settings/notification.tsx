import ToggleSwitch from "../toggle"



export function Notification() {

  return (
    <div className="p-4 border rounded-lg h-[80vh]   bg-white">
  <div className=" p-2 border-b border-[#DFE1E6]  ">
        <div className="flex flex-col justify-start items-start">
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
      </div>
        

      <div className="mt-4">
      <div className="p-2 border-b border-[#DFE1E6] flex justify-between items-center  ">
          <h2 className="text-lg ">Missed calls</h2>
          <ToggleSwitch />
      </div>
      <div className="p-2 border-b border-[#DFE1E6] flex justify-between items-center mt-2  ">
          <h2 className="text-lg ">Unread texts</h2>
          <ToggleSwitch />
      </div>
      <div className="p-2 border-b border-[#DFE1E6] flex justify-between items-center mt-2  ">
          <h2 className="text-lg ">Overdue tasks</h2>
          <ToggleSwitch />
      </div>
      <div className="p-2 border-b border-[#DFE1E6] flex justify-between items-center mt-2  ">
          <h2 className="text-lg ">Delivery method</h2>
          <form className="flex gap-4">
            <label className="flex gap-2 items-center">
    <input type="radio" name="option" value="option1" />
    SMS
  </label>

  <label className="flex gap-2 items-center">
    <input type="radio" name="option" value="option2" />
   Email
  </label>
  <label className="flex gap-2 items-center">
    <input type="radio" name="option" value="option3" />
   in-app notifications
  </label>
</form>
      </div>
      <div className="p-2 border-b border-[#DFE1E6] flex justify-between items-center mt-2  ">
          <h2 className="text-lg ">Notification and Reminder Settings</h2>
          <ToggleSwitch />
      </div>
      <div className="p-2 flex justify-between items-center mt-2  ">
          <h2 className="text-lg ">Default Scheduling Availability</h2>
          <ToggleSwitch />
      </div>
      </div>
    </div>
  )
}
