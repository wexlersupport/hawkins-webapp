export function getTotalCosts(data: any, item: string): number {
    const _data = data?.filter((items: any) => items?.item === item)
    return Number(_data.reduce((acc: Number, item: any) => Number(acc) + Number(item.cost), 0).toFixed(2))
}

export function getTotalMaterialCosts(data: any): number {
    const material_costs = getTotalCosts(data, 'mat_cost')
    const mat_cost_pvs_input = data?.find((items: any) => items?.item === 'mat_cost_pvs_input')
    const pvs = getPvs(material_costs, mat_cost_pvs_input.cost)
    const subtotal = getSubTotal(material_costs,pvs)
    const mat_cost_tax_input = data?.find((items: any) => items?.item === 'mat_cost_tax_input')
    const tax = getMatTax(subtotal, mat_cost_tax_input.cost)

    return Number((subtotal + tax).toFixed(2))
}

export function getPvs(material_costs: any, mat_cost_pvs_input: number): number {
    return Number((material_costs * mat_cost_pvs_input / 100).toFixed(2))
}

export function getSubTotal(material_costs: any, pvs: number): number {
    return Number((material_costs + pvs).toFixed(2))
}

export function getMatTax(subtotal: any, mat_cost_tax_input: number): number {
    return Number((subtotal * mat_cost_tax_input / 100).toFixed(2))
}

export function getLaborCosts(data: any): number {
    const laborHours = data.find((items: any) => items?.name === 'labor_hours')
    const laborRate = data.find((items: any) => items?.name === 'labor_rate')
    const overtimeHours = data.find((items: any) => items?.name === 'ot_hours')
    const overtimeRate = data.find((items: any) => items?.name === 'ot_rate')

    const labor = Number((laborHours?.cost * laborRate?.cost).toFixed(2))
    const ot = Number((overtimeHours?.cost * overtimeRate?.cost).toFixed(2))

    return Number((labor + ot).toFixed(2))
}

export function getBiddingPrice(data: any): number {
    const mat_gp_data = data.find((items: any) => items?.name === 'mat_gp')
    const mat_gp = getBiddingPriceMat(data, mat_gp_data?.cost)
    // console.log('mat_gp ', mat_gp)

    const laborHours = data.find((items: any) => items?.name === 'labor_hours')
    const labor_gp_data = data.find((items: any) => items?.name === 'labor_gp')
    const labor_gp = Number((laborHours?.cost * labor_gp_data?.cost).toFixed(2))
    // console.log('labor_gp ', labor_gp)

    const overtimeHours = data.find((items: any) => items?.name === 'ot_hours')
    const labor_ot_gp_data = data.find((items: any) => items?.name === 'labor_ot_gp')
    const labor_ot_gp = Number((overtimeHours?.cost * labor_ot_gp_data?.cost).toFixed(2))
    // console.log('labor_ot_gp ', labor_ot_gp)

    const misc_gp_data = data.find((items: any) => items?.name === 'misc_gp')
    const misc_gp = getBiddingPriceMisc(data, misc_gp_data?.cost)
    // console.log('misc_gp ', misc_gp)

    const subcon_gp_data = data.find((items: any) => items?.name === 'subcon_gp')
    const subcon_gp = getBiddingPriceSubcon(data, subcon_gp_data?.cost)
    // console.log('subcon_gp ', subcon_gp)

    return Number((mat_gp + labor_gp + labor_ot_gp + misc_gp + subcon_gp).toFixed(2))
}

export function getBiddingPriceMat(data: any, gp: number): number {
    const cost = getTotalMaterialCosts(data)

    return Number((cost / (1 - (gp / 100))).toFixed(2))
}

export function getBiddingPriceMisc(data: any, gp: number): number {
    const cost = getTotalCosts(data, 'misc_cost')

    return Number((cost / (1 - (gp / 100))).toFixed(2))
}

export function getBiddingPriceSubcon(data: any, gp: number): number {
    const cost = getTotalCosts(data, 'subcon_cost')

    return Number((cost / (1 - (gp / 100))).toFixed(2))
}

export function getFinalPrice(data: any): number {
    const bidding_price = getBiddingPrice(data)
    const extra_deduct = data?.find((item: any) => item.name === 'extra_deduct') || 0

    return Number((bidding_price + Number(extra_deduct?.cost)).toFixed(2))
}