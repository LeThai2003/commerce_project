import { Request, Response, NextFunction } from "express";
import Product from "../../models/product.model";

const addToCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let {product_id, ordered_quantity} = req.body;

        // Kiểm tra số lượng tồn kho của sản phẩm
        const product = await Product.findOne({
            where: {
                product_id: parseInt(product_id)
            },
            raw: true,
        });

        if (!product) {
            return res.json({
                code: 404,
                message: "Sản phẩm không tồn tại"
            });
        }

        // Kiểm tra số lượng đặt hàng không vượt quá tồn kho
        if (ordered_quantity > product["quantity"]) { // Giả sử 'stock_quantity' là tên cột chứa số lượng tồn kho
            return res.json({
                code: 400,
                message: `Số lượng đặt hàng không được vượt quá ${product["quantity"]}`
            });
        }

        next();
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi số lượng thêm vào giỏ hàng"
        })
    }
}

export default addToCard;