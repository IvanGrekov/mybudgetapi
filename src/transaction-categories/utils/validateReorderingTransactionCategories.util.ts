import { BadRequestException } from '@nestjs/common';

import { TransactionCategory } from '../../shared/entities/transaction-category.entity';

import { ReorderParentTransactionCategoryDto } from '../dtos/reorder-parent-transaction-category.dto';

const getReorderingNodeIds = (parentNodes: ReorderParentTransactionCategoryDto[]): number[] => {
    const nodeIds = new Set<number>();

    try {
        parentNodes.forEach(({ id: parentNodeId, childNodes }) => {
            if (nodeIds.has(parentNodeId)) {
                throw parentNodeId;
            }
            nodeIds.add(parentNodeId);

            if (!childNodes) {
                return;
            }
            childNodes.forEach(({ id: childNodeId }) => {
                if (nodeIds.has(childNodeId)) {
                    throw childNodeId;
                }
                nodeIds.add(childNodeId);
            });
        });
    } catch (id) {
        throw new BadRequestException(`Node for TransactionCategory #${id} has duplicate`);
    }

    return Array.from(nodeIds.keys());
};

const validateOrderValues = (
    nodes: ReorderParentTransactionCategoryDto[],
    parentId?: number,
): void => {
    const orderValues = new Map<number, number>();

    for (const { id, order, childNodes } of nodes) {
        const currentIdByOrder = orderValues.get(order);
        if (!currentIdByOrder) {
            orderValues.set(order, id);
        } else {
            throw new BadRequestException(
                `Order value ${order} used by several TransactionCategory #${currentIdByOrder} and #${id}`,
            );
        }

        if (childNodes?.length > 0) {
            validateOrderValues(childNodes, id);
        }
    }

    let orderCounter = 0;
    while (orderCounter !== orderValues.size) {
        if (!orderValues.has(orderCounter)) {
            const location = parentId
                ? `for children of TransactionCategory #${parentId}`
                : 'in TransactionCategories';
            throw new BadRequestException(`Order value ${orderCounter} is missing ${location}`);
        }
        orderCounter++;
    }
};

export const validateReorderingTransactionCategories = (
    parentNodes: ReorderParentTransactionCategoryDto[],
    currentTransactionCategories: TransactionCategory[],
) => {
    const nodeIds = getReorderingNodeIds(parentNodes);

    currentTransactionCategories.forEach(({ id }) => {
        const nodeIdIndex = nodeIds.findIndex((nodeId) => nodeId === id);

        if (nodeIdIndex === -1) {
            throw new BadRequestException(`Node for TransactionCategory #${id} not found`);
        }

        nodeIds.splice(nodeIdIndex, 1);
    });

    if (nodeIds.length > 0) {
        throw new BadRequestException(
            `Nodes [#${nodeIds.join(', #')}] not found in current active TransactionCategories`,
        );
    }

    validateOrderValues(parentNodes);
};
