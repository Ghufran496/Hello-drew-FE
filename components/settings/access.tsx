import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"


const member = [
  {
    name: "Audrey Fathia",
    avatar: "https://v0.dev/placeholder.svg",
    email: "audreyfathia@gmail.com",
    position: 'Admin'
  },

]



export function Access() {

  return (
    <div className="p-4 border rounded-lg h-[80vh]  bg-white">
  <div className="flex items-center justify-between p-2 border-b border-[#DFE1E6]  ">
        <div className="flex flex-col justify-start items-start">
          <h2 className="text-xl font-semibold">Access Levels & Teams</h2>
          <p className="text-[#667287]">Manage your team</p>
        </div>
        <Button  className="font-semibold bg-primary text-white px-6">Save</Button>
      </div>
        
        <div className="mt-5 p-2">
          <h1 className="font-semibold text-lg">Assign roles</h1>

          <div>
          <div className="flex justify-between items-center border-b border-[#DFE1E6] py-2">
              <div className="flex justify-start items-center gap-2">
              <Image src='/user.svg' alt="toolbox" width={20} height={20} />
              <p>Admin</p>
              </div>
              <Select defaultValue="hours">
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours" >can edit scripts</SelectItem>
              {/* <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="seconds">Second</SelectItem> */}
            </SelectContent>
          </Select>
             
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex justify-start items-center gap-2">
              <Image src='/toolbox.svg' alt="toolbox" width={20} height={20} />
              <p>Agent</p>
              </div>
              <Select defaultValue="hours">
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours">can only view assigned leads</SelectItem>
              {/* <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="seconds">Second</SelectItem> */}
            </SelectContent>
          </Select>
             
            </div>
          </div>
        </div>

      <div >
      {member.map((member, index) => (
            
      <div className="mt-5 p-2"
      key={index}
      >
      <h1 className="font-semibold text-lg">Team Members</h1>

      <div>
      <div className="flex justify-between items-center border-b border-[#DFE1E6] py-2 mt-4">
          <div className="flex justify-start items-center gap-2">
        <Image src={"/logo.svg"} alt='avatar' width={50} height={50} className="rounded-full bg-primary" />
         <div  className="text-xs md:text-md ">
         <p>{member.name}</p>
         <p className="text-[#667287]">{member.email}</p>
         </div>
       
          </div>
          <Select defaultValue="hours">
        <SelectTrigger className="w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
              <SelectItem value="hours">
              <div className="flex justify-center items-center gap-4">
              <Image src='/user.svg' alt="toolbox" width={20} height={20} />
              <p>Admin</p>
              </div>
              </SelectItem>
        </SelectContent>
      </Select>
         
        </div>
      </div>
    </div>
            ))}
      </div>

    </div>
  )
}
