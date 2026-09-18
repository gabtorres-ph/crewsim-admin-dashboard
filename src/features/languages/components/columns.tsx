"use client"

import { type Language } from "../model"
import { Checkbox } from "@/shared/ui/Checkbox"
import { DataTableColumnHeader } from "@/shared/ui/data-table/DataColumnHeader"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"

const columnHelper = createColumnHelper<Language>()

export const columns = [
	columnHelper.display({
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected()
					? true
					: table.getIsSomeRowsSelected()
						? "indeterminate"
						: false
				}
				onCheckedChange={() => table.toggleAllPageRowsSelected()}
				className="translate-y-0.5"
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={() => row.toggleSelected()}
				className="translate-y-0.5"
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
		meta: {
				displayName: "Select"
		},
	}),
	columnHelper.accessor("name", {
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		enableSorting: true,
		enableHiding: false,
		meta: {
				className: "text-left",
				displayName: "Name"
		},
	}),
	columnHelper.accessor("iso1", {
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="ISO" />
		),
		enableSorting: true,
		enableHiding: false,
		meta: {
				className: "text-left",
				displayName: "ISO"
		},
	}),
] as ColumnDef<Language>[]