import type React from "react"
import { useFormStore } from "@/app/store/formStore"

const Step3: React.FC = () => {
  const { formData, updateFormData } = useFormStore()

  const handleInterestChange = (interest: string) => {
    const updatedInterests = formData.step3.interests.includes(interest)
      ? formData.step3.interests.filter((i: string) => i !== interest)
      : [...formData.step3.interests, interest]
    updateFormData("step3", { interests: updatedInterests })
  }

  const interests = ["Technology", "Sports", "Music", "Art", "Travel"]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Step 3: Interests</h2>
      {interests.map((interest) => (
        <label key={interest} className="block mb-2">
          <input
            type="checkbox"
            checked={formData.step3.interests.includes(interest)}
            onChange={() => handleInterestChange(interest)}
            className="mr-2"
          />
          {interest}
        </label>
      ))}
    </div>
  )
}

export default Step3

