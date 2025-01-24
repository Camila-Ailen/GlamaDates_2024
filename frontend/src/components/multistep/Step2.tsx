import type React from "react"
import { useFormStore } from "@/app/store/formStore"

const Step2: React.FC = () => {
  const { formData, updateFormData } = useFormStore()

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Step 2: Professional Information</h2>
      <input
        type="number"
        value={formData.step2.age}
        onChange={(e) => updateFormData("step2", { age: Number.parseInt(e.target.value) })}
        placeholder="Age"
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="text"
        value={formData.step2.occupation}
        onChange={(e) => updateFormData("step2", { occupation: e.target.value })}
        placeholder="Occupation"
        className="w-full p-2 mb-4 border rounded"
      />
    </div>
  )
}

export default Step2

