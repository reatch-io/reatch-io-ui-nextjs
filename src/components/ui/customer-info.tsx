import React from "react"

type CustomerInfoProps = {
  firstName: string
  lastName: string
  email: string
}

export function CustomerInfo({ firstName, lastName, email }: CustomerInfoProps) {
  return (
    <div>
      <div className="font-bold">{firstName + " " + lastName}</div>
      <div className="text-gray-500">{email}</div>
    </div>
  )
}