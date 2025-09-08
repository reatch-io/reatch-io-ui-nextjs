'use client'

import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Customer } from "@/models/customer";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, BarChart2, Send, Activity } from "lucide-react";
import CustomerInformation from "./customer-information";

export default function CustomerDetailsPage() {
  const params = useParams();
  const { projectId, systemId } = params as { projectId: string; systemId: string };
  const [ customer, setCustomer ] = useState<Customer>();

  useEffect(() => {
    api.get(`/api/customers/${systemId}`, {
      headers: {
        "X-Project-ID": projectId,
      },
    }).then((response) => {
      setCustomer(response.data);
    }).catch((error) => {
      console.error(error);
    });
  }, [systemId]);

  return (
    <div>
      <div className="mb-6">
        <Link href={`.`}>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Customers
          </Button>
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            {customer?.firstName} {customer?.lastName}
          </h3>
          <p className="leading-7">Customer ID: {customer?.customerId}</p>
        </div>
        <Link href={`${systemId}/edit`}>
          <Button className="ml-4 bg-gradient-primary" variant="default">
            <Pencil size={16} />
            Edit customer
          </Button>
        </Link>
      </div>
      <div className="mt-8">
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <User size={16} /> Customer Information
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <BarChart2 size={16} /> Engagement statistics
            </TabsTrigger>
            <TabsTrigger value="campaign" className="flex items-center gap-2">
              <Send size={16} /> Campaign attribution
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-2">
              <Activity size={16} /> Behavior trends
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <CustomerInformation customer={customer} />
          </TabsContent>
          <TabsContent value="engagement">
            <div className="p-4">Engagement statistics</div>
          </TabsContent>
          <TabsContent value="campaign">
            <div className="p-4">Campaign attribution</div>
          </TabsContent>
          <TabsContent value="behavior">
            <div className="p-4">Behavior trends</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}