import { Avatar, Button, DatePicker, Input, Select, SelectItem } from "@heroui/react"
import { capitalize, lowerCase } from "lodash"
import { FaLocationDot } from "react-icons/fa6";
import { GetDateTimestamp, customParseDate } from "./services/timeFunctions";
import { fromDate } from '@internationalized/date';
import { Accordion, AccordionItem } from "@heroui/react";
import { RiEdit2Fill } from "react-icons/ri";

const interpretElement = ({ element, data, index }) => {
    if (element.field_type == "input") {
        if (element.input_type == "text") {
            return <Input key={index} isClearable className="dark:text-zinc-200" value={data}
                placeholder={`Enter ${lowerCase(element.field_label)} ...`} size="sm" label={element.field_label} />
        }
    }

    else if (element.field_type == "location") {
        return <div key={index} className="flex flex-col">
            <p className="text-xs mb-1  text-zinc-400 p-0">{element.field_label || element.field_key} :</p>
            <div className="flex gap-2">
                <Input value={data.latitude} className="dark:text-zinc-200" placeholder="Enter longitude ..." size="sm" label="Latitude" />
                <Input value={data.longitude} className="dark:text-zinc-200" placeholder="Enter latitude ..." size="sm" label="Longitude" />
                <Button color="primary" isDisabled size="sm" className="h-auto"><FaLocationDot className="size-4" /></Button>
            </div>
        </div>
    }
    else if (element.field_type == "datepicker") {
        const date = customParseDate(data)
        const calendarDate = fromDate(date)
        return <DatePicker key={index} value={calendarDate} size="sm" label={element.field_label || element.field_key} />
    }

    else if (element.field_type == "select") {

        return <Select selectedKeys={[data]} size="sm" label={capitalize(element.field_label)} className="!text-zinc-200">
            {element.select_options && element.select_options.map(option => <SelectItem key={option.label} className="text-zinc-200">
                {option.label}
            </SelectItem>)}
        </Select>
    }
    else if (element.field_type == "picturepicker") {
        return <div className="flex flex-col">
            <p className="text-xs mb-1   text-zinc-400 p-0">{element.field_label || element.field_key} :</p>
            <div className="flex gap-4 p-2 justify-between w-fit bg-zinc-100  rounded-xl">
                <Avatar src="https://media.istockphoto.com/id/469538141/fr/photo/jeune-plant.jpg?s=612x612&w=0&k=20&c=YusPoy6PHk7ai5y4iMzgx_RpVJjcmvyVelmfUBkUSKk=" size="lg" radius="lg" />
                <Button color="default" isDisabled size="sm" className="h-auto"><RiEdit2Fill className="size-4" /></Button>
            </div>
        </div>
    }

    else if (element.field_type == "sections") {
        return <div className="flex flex-col" key={index}>
            <p className="text-xs mb-1  text-zinc-400 p-0">{element.field_label || element.field_key} :</p>
            <Accordion className="!px-0" isCompact>
                {
                    data.map((section, i) => {
                        const sectionForm = element.field_children.find(e => e.field_label == data[i].$label)
                        return <AccordionItem title={data[i].$label}>
                            <div className="flex gap-2 flex-col">
                            {sectionForm.field_children.map(sectionElement => interpretElement({ element: sectionElement, data: data[i][sectionElement.field_key], index: i }))}
                            </div>
                           
                        </AccordionItem>
                    })
                }
            </Accordion>
        </div>
    }
}

export const FormInterpreter = ({ form, data }) => {
    return <div className="flex h-full gap-2  flex-col">
        {form.form.map((element, index) => interpretElement({ element, data: data[element.field_key], index }))}
    </div>
}